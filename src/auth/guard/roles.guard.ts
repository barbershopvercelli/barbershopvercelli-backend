import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const roles = this.reflector.get<string[]>('roles', context.getHandler())
        const request = context.switchToHttp().getRequest()

        if (request?.user) {
            const { id } = request.user
            const user = await this.prisma.user.findUnique({
                where: {
                    id
                }
            })
            return roles.includes(user.role)
        }
        return false
    }

}