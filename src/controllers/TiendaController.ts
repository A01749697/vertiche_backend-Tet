/* ============================================================================
 * Archivo: TiendaController.ts
 * Generado por: Claude (asistente IA).
 * Descripción: Controller singleton para la entidad Tienda. Listar y crear
 *              tiendas destino.
 * ============================================================================ */
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class TiendaController extends AbstractController{
    //Singleton
    private static _instance:TiendaController;
    public static get instance():TiendaController{
        return this._instance || 
        (this._instance = new this("Tienda"));
    }
    protected initRoutes(): void {
        this.router.get('/listarTiendas',
            this.getListarTiendas.bind(this));
        this.router.post('/crearTienda',
            this.postCrearTienda.bind(this));
    }

    private async getListarTiendas(req:Request,res:Response):Promise<void>{
        //SELECT * FROM Tienda
        try{
            const tiendas = await db.Tienda.findAll();
            res.status(200).json(tiendas);
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
    private async postCrearTienda(req:Request,res:Response):Promise<void>{
        //INSERT INTO Tienda
        try{
            console.log(req.body);
            await db['Tienda'].create(req.body);
            res.status(200).json({message:"Registro de tienda exitoso"});
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
}