/* ============================================================================
 * Archivo: ProveedorController.ts
 * Generado por: Claude (asistente IA).
 * Descripción: Controller singleton para la entidad Proveedor. Expone rutas
 *              para listar y crear proveedores. Sigue el patrón de
 *              ProyectoController.ts.
 * ============================================================================ */
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class ProveedorController extends AbstractController{
    //Singleton
    //Atributos de clase
    private static _instance:ProveedorController;
    //Métodos de clase
    public static get instance():ProveedorController{
        return this._instance || 
        (this._instance = new this("Proveedor"));
    }
    //Método de instancia
    protected initRoutes(): void {
        this.router.get('/listarProveedores',
            this.getListarProveedores.bind(this));
        this.router.post('/crearProveedor',
            this.postCrearProveedor.bind(this));
    }

    private async getListarProveedores(req:Request,res:Response):Promise<void>{
        //SELECT * FROM Proveedor
        try{
            const proveedores = await db.Proveedor.findAll();
            res.status(200).json(proveedores);
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
    private async postCrearProveedor(req:Request,res:Response):Promise<void>{
        //INSERT INTO Proveedor
        try{
            console.log(req.body);
            await db['Proveedor'].create(req.body);
            res.status(200).json({message:"Registro de proveedor exitoso"});
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
}