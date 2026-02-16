import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { PlaceOrderUseCase } from "../../application/use-cases/order/PlaceOrderUseCase.js";
import { GetOrderHistoryUseCase } from "../../application/use-cases/order/GetOrderHistoryUseCase.js";
import { GetOrderByIdUseCase } from "../../application/use-cases/order/GetOrderByIdUseCase.js";
import { PlaceOrderDTO } from "../../application/dto/PlaceOrderDTO.js";
import { Logger } from "../../infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
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

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order,
        });
    };

    getOrderHistory = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const orders = await this.getOrderHistoryUseCase.execute(userId as string, limit);

        res.status(200).json({
            success: true,
            data: orders,
        });
    };

    getOrderById = async (req: Request, res: Response): Promise<void> => {
        const { orderId } = req.params;

        const order = await this.getOrderByIdUseCase.execute(orderId as string);

        res.status(200).json({
            success: true,
            data: order,
        });
    };
}
