import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { StockMovement, StockType } from '../entities/stock-movement.entity';
import { Inject } from '@nestjs/common';
import type { Producer } from 'kafkajs';
import { In } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,

    @Inject('KAFKA_PRODUCER')
    private producer: Producer,

    private dataSource: DataSource,
  ) {}

  async getStockBulkByProductIds(productIds: number[]) {
    if (!productIds?.length) {
      return [];
    }

    const inventories = await this.inventoryRepo.find({
      where: {
        productId: In(productIds),
      },
    });

    return inventories;
  }

  // ===================================================
  // ================= SAGA HANDLERS ===================
  // ===================================================

  async handleReserve(data: any) {
    // const { productId, orderId, quantity } = data;
    const { orderId, items } = data;

    try {
      // await this.reserve(productId, orderId, quantity);
      await this.reserveItems(orderId, items);


      await this.publish('inventory.reserved', data);
    } catch (err) {
      await this.publish('inventory.reserve.failed', {
        orderId,
        reason: err.message,
      });
    }
  }

  async handleRelease(data: any) {
    // const { productId, orderId, quantity } = data;
    const { orderId, items } = data;

    try {
      // await this.release(productId, orderId, quantity);
      await this.releaseItems(orderId, items);

      await this.publish('inventory.released', data);
    } catch (err) {
      await this.publish('inventory.release.failed', {
        orderId,
        reason: err.message,
      });
    }
  }

  async handleConfirm(data: any) {
    // const { productId, orderId, quantity } = data;
    const { orderId, items } = data;

    try {
      // await this.confirm(productId, orderId, quantity);
      await this.confirmItems(orderId, items);

      await this.publish('inventory.confirmed', data);
    } catch (err) {
      await this.publish('inventory.confirm.failed', {
        orderId,
        reason: err.message,
      });
    }
  }

  // ===================================================
  // =================== PUBLISHER =====================
  // ===================================================

  private async publish(topic: string, payload: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: payload.orderId?.toString(),
          value: JSON.stringify(payload),
        },
      ],
    });
    console.log('Published successfully:', topic);
  }

  // ===================================================
  // ==================== HELPERS ======================
  // ===================================================

  private async getInventoryOrThrow(
    manager: EntityManager,
    productId: number,
  ): Promise<Inventory> {
    const inventory = await manager.findOne(Inventory, {
      where: { productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!inventory) {
      throw new BadRequestException('Inventory not found');
    }

    return inventory;
  }

  private async movementExists(
    manager: EntityManager,
    orderId: string,
    productId: number,
    type: StockType,
  ) {
    return manager.findOne(StockMovement, {
      where: { orderId, productId, type },
    });
  }

  private async getReserveMovement(
    manager: EntityManager,
    orderId: string,
    productId: number,
  ) {
    return manager.findOne(StockMovement, {
      where: {
        orderId,
        productId,
        type: StockType.RESERVE,
      },
    });
  }

  // ===================================================
  // ===================== STOCK IN ====================
  // ===================================================

  async stockIn(productId: number, quantity: number, reference?: string) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    return this.dataSource.transaction(async manager => {
      let inventory = await manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        inventory = manager.create(Inventory, {
          productId,
          available: 0,
          reserved: 0,
        });
      }

      inventory.available += quantity;
      await manager.save(inventory);

      await manager.save(StockMovement, {
        productId,
        quantity,
        type: StockType.IN,
        reference,
      });

      return inventory;
    });
  }

  // ===================================================
  // ===================== RESERVE =====================
  // ===================================================

  // async reserve(productId: number, orderId: string, quantity: number) {
  //   if (quantity <= 0) {
  //     throw new BadRequestException('Quantity must be greater than 0');
  //   }

  //   return this.dataSource.transaction(async manager => {
  //     const existed = await this.movementExists(
  //       manager,
  //       orderId,
  //       productId,
  //       StockType.RESERVE,
  //     );
  //     if (existed) return;

  //     const inventory = await this.getInventoryOrThrow(manager, productId);

  //     if (inventory.available < quantity) {
  //       throw new BadRequestException('Not enough stock');
  //     }

  //     inventory.available -= quantity;
  //     inventory.reserved += quantity;

  //     await manager.save(inventory);

  //     await manager.save(StockMovement, {
  //       productId,
  //       orderId,
  //       quantity,
  //       type: StockType.RESERVE,
  //     });

  //     return inventory;
  //   });
  // }

  async reserveItems(orderId: string, items: any[]) {
  return this.dataSource.transaction(async manager => {
    for (const item of items) {
      const { productId, quantity } = item;

      if (quantity <= 0) {
        throw new BadRequestException('Invalid quantity');
      }

      const existed = await manager.findOne(StockMovement, {
        where: {
          orderId,
          productId,
          type: StockType.RESERVE,
        },
      });

      if (existed) continue;

      const inventory = await manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        throw new BadRequestException(
          `Inventory not found for product ${productId}`,
        );
      }

      if (inventory.available < quantity) {
        throw new BadRequestException(
          `Not enough stock for product ${productId}`,
        );
      }

      inventory.available -= quantity;
      inventory.reserved += quantity;

      await manager.save(inventory);

      await manager.save(StockMovement, {
        productId,
        orderId,
        quantity,
        type: StockType.RESERVE,
      });
    }
  });
}

  // ===================================================
  // ===================== RELEASE =====================
  // ===================================================

  // async release(productId: number, orderId: string, quantity: number) {
  //   if (quantity <= 0) {
  //     throw new BadRequestException('Quantity must be greater than 0');
  //   }

  //   return this.dataSource.transaction(async manager => {
  //     const existed = await this.movementExists(
  //       manager,
  //       orderId,
  //       productId,
  //       StockType.RELEASE,
  //     );
  //     if (existed) return;

  //     const confirmed = await this.movementExists(
  //       manager,
  //       orderId,
  //       productId,
  //       StockType.CONFIRM,
  //     );
  //     if (confirmed) {
  //       throw new BadRequestException('Order already confirmed');
  //     }

  //     const reservedMovement = await this.getReserveMovement(
  //       manager,
  //       orderId,
  //       productId,
  //     );
  //     if (!reservedMovement) {
  //       throw new BadRequestException('Order was not reserved');
  //     }

  //     const inventory = await this.getInventoryOrThrow(manager, productId);

  //     if (inventory.reserved < reservedMovement.quantity) {
  //       throw new BadRequestException('Reserved stock is insufficient');
  //     }

  //     inventory.available += reservedMovement.quantity;
  //     inventory.reserved -= reservedMovement.quantity;

  //     await manager.save(inventory);

  //     await manager.save(StockMovement, {
  //       productId,
  //       orderId,
  //       quantity: reservedMovement.quantity,
  //       type: StockType.RELEASE,
  //     });

  //     return inventory;
  //   });
  // }
  async releaseItems(orderId: string, items: any[]) {
    return this.dataSource.transaction(async manager => {
      for (const item of items) {
        const { productId } = item;

        // Idempotent check
        const existed = await manager.findOne(StockMovement, {
          where: {
            orderId,
            productId,
            type: StockType.RELEASE,
          },
        });

        if (existed) continue;

        // Không cho release nếu đã confirm
        const confirmed = await manager.findOne(StockMovement, {
          where: {
            orderId,
            productId,
            type: StockType.CONFIRM,
          },
        });

        if (confirmed) {
          throw new BadRequestException(
            `Product ${productId} already confirmed (shipped)`,
          );
        }

        const reservedMovement = await manager.findOne(StockMovement, {
          where: {
            orderId,
            productId,
            type: StockType.RESERVE,
          },
        });

        if (!reservedMovement) {
          throw new BadRequestException(
            `Product ${productId} was not reserved`,
          );
        }

        const inventory = await manager.findOne(Inventory, {
          where: { productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inventory) {
          throw new BadRequestException(
            `Inventory not found for product ${productId}`,
          );
        }

        if (inventory.reserved < reservedMovement.quantity) {
          throw new BadRequestException(
            `Reserved stock insufficient for product ${productId}`,
          );
        }

        // Rollback stock
        inventory.available += reservedMovement.quantity;
        inventory.reserved -= reservedMovement.quantity;

        await manager.save(inventory);

        await manager.save(StockMovement, {
          productId,
          orderId,
          quantity: reservedMovement.quantity,
          type: StockType.RELEASE,
        });
      }
    });
  }

  // ===================================================
  // ===================== CONFIRM =====================
  // ===================================================

  // async confirm(productId: number, orderId: string, quantity: number) {
  //   if (quantity <= 0) {
  //     throw new BadRequestException('Quantity must be greater than 0');
  //   }

  //   return this.dataSource.transaction(async manager => {
  //     const existed = await this.movementExists(
  //       manager,
  //       orderId,
  //       productId,
  //       StockType.CONFIRM,
  //     );
  //     if (existed) return;

  //     const released = await this.movementExists(
  //       manager,
  //       orderId,
  //       productId,
  //       StockType.RELEASE,
  //     );
  //     if (released) {
  //       throw new BadRequestException('Cannot release stock because it has already been confirmed (shipped)');
  //     }

  //     const reservedMovement = await this.getReserveMovement(
  //       manager,
  //       orderId,
  //       productId,
  //     );
  //     if (!reservedMovement) {
  //       throw new BadRequestException('Order was not reserved');
  //     }

  //     if (reservedMovement.quantity !== quantity) {
  //       throw new BadRequestException(
  //         'Confirm quantity does not match reserved quantity',
  //       );
  //     }

  //     const inventory = await this.getInventoryOrThrow(manager, productId);

  //     if (inventory.reserved < quantity) {
  //       throw new BadRequestException('Reserved stock is insufficient');
  //     }

  //     inventory.reserved -= quantity;

  //     await manager.save(inventory);

  //     await manager.save(StockMovement, {
  //       productId,
  //       orderId,
  //       quantity,
  //       type: StockType.CONFIRM,
  //     });

  //     return inventory;
  //   });
  // }
  async confirmItems(orderId: string, items: any[]) {
    return this.dataSource.transaction(async manager => {
      for (const item of items) {
        const { productId, quantity } = item;

        // Idempotent check
        const existed = await manager.findOne(StockMovement, {
          where: {
            orderId,
            productId,
            type: StockType.CONFIRM,
          },
        });

        if (existed) continue;

        // Không cho confirm nếu đã release
        const released = await manager.findOne(StockMovement, {
          where: {
            orderId,
            productId,
            type: StockType.RELEASE,
          },
        });

        if (released) {
          throw new BadRequestException(
            `Cannot confirm product ${productId} because it was released`,
          );
        }

        const reservedMovement = await manager.findOne(StockMovement, {
          where: {
            orderId,
            productId,
            type: StockType.RESERVE,
          },
        });

        if (!reservedMovement) {
          throw new BadRequestException(
            `Product ${productId} was not reserved`,
          );
        }

        if (reservedMovement.quantity !== quantity) {
          throw new BadRequestException(
            `Confirm quantity mismatch for product ${productId}`,
          );
        }

        const inventory = await manager.findOne(Inventory, {
          where: { productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inventory) {
          throw new BadRequestException(
            `Inventory not found for product ${productId}`,
          );
        }

        if (inventory.reserved < quantity) {
          throw new BadRequestException(
            `Reserved stock insufficient for product ${productId}`,
          );
        }

        // Xuất kho
        inventory.reserved -= quantity;

        await manager.save(inventory);

        await manager.save(StockMovement, {
          productId,
          orderId,
          quantity,
          type: StockType.CONFIRM,
        });
      }
    });
  }
}