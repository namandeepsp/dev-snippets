"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
/**
 * Abstract Base Service
 * Implements common CRUD operations
 * Extend this class for feature-specific services
 */
class BaseService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(input) {
        return this.repository.create(input);
    }
    async getById(id) {
        return this.repository.getById(id);
    }
    async update(id, input) {
        return this.repository.update(id, input);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
}
exports.BaseService = BaseService;
