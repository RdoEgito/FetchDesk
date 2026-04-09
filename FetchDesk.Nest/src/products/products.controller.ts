import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductEntity } from "../entities/product.entity";

@Controller("products")
export class ProductsController {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>
  ) {}

  @Get()
  async getProducts() {
    return { products: await this.products.find() };
  }

  @Get(":id")
  async getProductById(@Param("id") id: string) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException();
    return product;
  }

  @Post()
  async createProduct(@Body() body: { name: string; currentPrice: number }) {
    const product = this.products.create({
      name: body.name,
      currentPrice: body.currentPrice,
      isActive: true,
    });
    const saved = await this.products.save(product);
    return saved;
  }

  @Put(":id")
  @HttpCode(204)
  async updateProduct(
    @Param("id") id: string,
    @Body() body: { name: string; currentPrice: number; isActive: boolean }
  ) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException();
    product.name = body.name;
    product.currentPrice = body.currentPrice;
    product.isActive = body.isActive;
    await this.products.save(product);
    return;
  }

  @Delete(":id")
  @HttpCode(204)
  async deleteProduct(@Param("id") id: string) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException();
    product.isActive = false;
    await this.products.save(product);
    return;
  }
}
