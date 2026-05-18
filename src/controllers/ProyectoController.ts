import { Request,Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class ProyectoController extends AbstractController{
    //Singleton
    //Atributos de clase
    private static _instance:ProyectoController;
    //Métodos de clase
    public static get instance():ProyectoController{
        return this._instance || 
        (this._instance = new this("Proyecto"));
    }
    //Metodo de instancia
    protected initRoutes(): void {
        this.router.get('/listarProyectos',
            this.getListarProyectos.bind(this));
        this.router.post('/crearProyecto',
            this.postCrearProyecto.bind(this));    
    }

    private async getListarProyectos(req:Request,res:Response):Promise<void>{
        //SELECT
        try{
            const proyectos = await db.Proyecto.findAll();
            res.status(200).json(proyectos);
        }catch(err){
            console.log(err);
            res.status(500).json(err)
        }
        
    }
    private async postCrearProyecto(req:Request,res:Response):Promise<void>{
        //CREATE
        try{
            console.log(req.body);
            await db['Proyecto'].create(req.body);
            res.status(200).json({message:"Registro de proyecto exitoso"});
        }catch(err){
            console.log(err);
            res.status(500).json(err)
        }
    }

}