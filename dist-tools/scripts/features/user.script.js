"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserScript = void 0;
const user_container_1 = require("../../src/features/user/user.container");
const base_script_1 = require("../core/base.script");
class UserScript extends base_script_1.BaseScript {
    constructor() {
        super(...arguments);
        this.name = 'User Tests';
    }
    async run() {
        await this.ensureReady();
        this.log('Running user tests...');
        await this.testCreateUser();
        await this.testGetUserById();
        await this.testGetUserByUsername();
        await this.testGetUserByEmail();
        await this.testUpdateUser();
        await this.testDeleteUser();
        this.logSuccess('All user tests passed');
    }
    async testCreateUser() {
        const timestamp = Date.now();
        const username = this.buildValidUsername(timestamp);
        const input = {
            uid: `test-user-${timestamp}`,
            username,
            email: `test-${timestamp}@example.com`,
            name: 'Test User',
            avatarUrl: null,
            bio: '',
        };
        const user = await user_container_1.userService.createUser(input);
        if (!user.id || user.username !== input.username) {
            throw new Error('Create user failed');
        }
        this.userId = user.id;
        this.username = user.username;
        this.email = user.email;
        this.log('✓ Create user');
    }
    buildValidUsername(timestamp) {
        // Keep username within service validation rule: [a-zA-Z0-9_]{3,20}
        return `u_${timestamp.toString().slice(-10)}`;
    }
    async testGetUserById() {
        if (!this.userId) {
            throw new Error('Get user by ID failed (missing test user)');
        }
        const user = await user_container_1.userService.getUserById(this.userId);
        if (!user) {
            throw new Error('Get user by ID failed');
        }
        this.log('✓ Get user by ID');
    }
    async testGetUserByUsername() {
        if (!this.username) {
            throw new Error('Get user by username failed (missing test user)');
        }
        const user = await user_container_1.userService.getPublicProfile(this.username);
        if (!user) {
            throw new Error('Get user by username failed');
        }
        this.log('✓ Get user by username');
    }
    async testGetUserByEmail() {
        if (!this.email) {
            throw new Error('Get user by email failed (missing test user)');
        }
        const user = await user_container_1.userService.getUserByEmail(this.email);
        if (!user) {
            throw new Error('Get user by email failed');
        }
        this.log('✓ Get user by email');
    }
    async testUpdateUser() {
        if (!this.userId) {
            throw new Error('Update user failed (missing test user)');
        }
        const updateInput = {
            name: 'Updated Name',
            bio: 'Updated bio',
        };
        await user_container_1.userService.updateUser(this.userId, updateInput, this.userId);
        this.log('✓ Update user');
    }
    async testDeleteUser() {
        if (!this.userId) {
            throw new Error('Delete user failed (missing test user)');
        }
        await user_container_1.userService.deleteUser(this.userId, this.userId);
        this.log('✓ Delete user');
    }
}
exports.UserScript = UserScript;
