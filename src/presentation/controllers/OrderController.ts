import { Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { PlaceOrderUseCase } from "@application/use-cases/order/PlaceOrderUseCase.js";
import { GetOrderHistoryUseCase } from "@application/use-cases/order/GetOrderHistoryUseCase.js";
import { GetOrderByIdUseCase } from "@application/use-cases/order/GetOrderByIdUseCase.js";
import { PlaceOrderDTO } from "@application/dto/PlaceOrderDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { ResponseHelper } from "@presentation/helpers/ResponseHelper.js";

@singleton()
export class OrderController {
    constructor(
        @inject(PlaceOrderUseCase)
        private readonly placeOrderUseCase: PlaceOrderUseCase,
        
        @inject(GetOrderHistoryUseCase)
        private readonly getOrderHistoryUseCase: GetOrderHistoryUseCase,

        @inject(GetOrderByIdUseCase)
        private readonly getOrderByIdUseCase: GetOrderByIdUseCase,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    placeOrder = async (req: Request, res: Response): Promise<void> => {
        const dto: PlaceOrderDTO = {
            userId: req.body.userId,
            items: req.body.items,
            shippingAddress: req.body.shippingAddress,
            billingAddress: req.body.billingAddress || req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            paymentDetails: req.body.paymentDetails,
        };

        const order = await this.placeOrderUseCase.execute(dto);

        ResponseHelper.created(res, order, "Order placed successfully");
    };

    getOrderHistory = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const orders = await this.getOrderHistoryUseCase.execute(userId as string, limit);

        ResponseHelper.success(res, orders);
    };

    getOrderById = async (req: Request, res: Response): Promise<void> => {
        const { orderId } = req.params;

        const order = await this.getOrderByIdUseCase.execute(orderId as string);

        ResponseHelper.success(res, order);
    };
}
