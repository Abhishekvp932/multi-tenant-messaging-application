import { Document, Model, FilterQuery } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private _model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this._model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this._model.findById(id);
  }

  async findAll(filter:FilterQuery<T>,skip:number,limit:number): Promise<T[]> {
    return await this._model.find(filter)
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)
  }

  async delete(id: string): Promise<T | null> {
    return await this._model.findByIdAndDelete(id);
  }

  async findByIdAndUpdate(id: string, data: Partial<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data);
  }
}
