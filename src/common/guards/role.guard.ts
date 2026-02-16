import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
@Injectable()
export class RolesGuard  implements CanActivate{
    constructor(private reflactor : Reflector){}
    canActivate(context: ExecutionContext): boolean  {
        const roles =this.reflactor.get("roles",context.getHandler())
        console.log(roles);
        return true
        
    }
}