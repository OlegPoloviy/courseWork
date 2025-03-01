import { Controller, Get,Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get()
    async getUsers() {
        return this.userService.findAllUsers();
    }

    @Post()
    async createUser(@Body() body){
        const {email,name,password} = body;
        return this.userService.createUser(email,name,password);
    }

    @Post('find')
    async findUser(@Body() body){
        const {email} = body;
        return this.userService.findUserByEmail(email);
    }
    
    @Post('login')
    async login(@Body() body){
        const {email,password} = body;
        return this.userService.login(email,password);
    }
}
