import { Repository } from "typeorm";
import { ProductEntity } from "../entities/product.entity";
export declare class ProductsController {
    private readonly products;
    constructor(products: Repository<ProductEntity>);
    getProducts(): Promise<{
        products: ProductEntity[];
    }>;
    getProductById(id: string): Promise<ProductEntity>;
    createProduct(body: {
        name: string;
        currentPrice: number;
    }): Promise<ProductEntity>;
    updateProduct(id: string, body: {
        name: string;
        currentPrice: number;
        isActive: boolean;
    }): Promise<void>;
    deleteProduct(id: string): Promise<void>;
}
