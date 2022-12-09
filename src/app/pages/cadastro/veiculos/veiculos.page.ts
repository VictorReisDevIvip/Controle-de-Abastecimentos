import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import {collection, addDoc, getFirestore, getDocs} from 'firebase/firestore'

@Component({
  selector: 'app-veiculos',
  templateUrl: './veiculos.page.html',
  styleUrls: ['./veiculos.page.scss'],
})
export class VeiculosPage implements OnInit {

  constructor(public menuCtrl : MenuController, 
    public navCtrl : NavController,
    public alertCtrl : AlertController,
    public toastCtrl : ToastController,
    public loadCtrl  : LoadingController) { }

  auth = getAuth()
  marcas                : any = []
  modelos               : any = []
  inpPlaca1             : string = ""
  inpPlaca2             : string = ""
  radioTipoVeiculo      : string = ""
  selectMarca           : number = null
  selectModelo          : number = null
  inpAnoVeiculo         : number = 0
  inpCilindradaVeiculo  : number = 0
  inpKmAtual            : number = 0
  userEmail             : string

  ngOnInit() {
    this.menuCtrl.enable(true)
    onAuthStateChanged(this.auth, (usuario) => {
      if (usuario){
        this.userEmail = usuario.email
      }
    }) 
  }

  toHome(){
    //metodo para retornar à home em caso de cancelamento do cadastro
    this.navCtrl.navigateForward("home")
  }

  async carregarMarcas(){
    const load = await this.loadCtrl.create({
      message : 'Carregando marcas...'
    })
    load.present()
    this.marcas = []
    var i = 0
    const consulta = await getDocs(collection(getFirestore(), `marcas-${this.radioTipoVeiculo}s/`))
    consulta.forEach(doc => {
      this.marcas[i] = {
        id        : i,
        valor     : doc.get('valor'),
        nomeMarca : doc.get('nomeMarca')
      }
      i++
    })
    load.dismiss()
  }

  async carregarModelos(){
    const load = await this.loadCtrl.create({
      message : 'Carregando modelos...'
    })
    load.present()
    this.modelos = []
    var i = 0
    const consulta = await getDocs(collection(getFirestore(), `marcas-${this.radioTipoVeiculo}s/${this.marcas[this.selectMarca].valor}/modelos`))
    consulta.forEach(doc => {
      if(this.radioTipoVeiculo == 'moto'){
        this.modelos[i] = {
          id          : i,
          valor       : doc.get('valor'),
          nomeModelo  : doc.get('nomeModelo'),
          cilindrada  : doc.get('cilindrada')
        }
      }else{
        this.modelos[i] = {
          id          : i,
          valor       : doc.get('valor'),
          nomeModelo  : doc.get('nomeModelo')
        }
      }
      i++
    })
    load.dismiss()
  }

  async setCilindrada(){
    const load = await this.loadCtrl.create({
      message : 'Carregando informações do veículo...'
    })
    if(this.radioTipoVeiculo == 'moto'){
      load.present()
      var cilindrada = this.modelos[this.selectModelo].cilindrada;
      this.inpCilindradaVeiculo = cilindrada
    }else{
      this.inpCilindradaVeiculo = 0
    }
    load.dismiss()
  }

  async cadastrar(){
    const load = await this.loadCtrl.create({
      message : 'Tentando cadastrar o veículo...'
    })
    if(this.inpPlaca1 == '' || 
      this.inpPlaca2 == '' || 
      this.radioTipoVeiculo == '' || 
      this.selectMarca == null || 
      this.selectModelo == null || 
      this.inpCilindradaVeiculo == 0 || 
      this.inpAnoVeiculo == 0 ){
        this.alertCamposVazios()
    }else{
      load.present()
      await addDoc (collection(getFirestore(),`users/${this.userEmail}/veiculos`), {
        "tipoVeiculo" : this.radioTipoVeiculo,
        "placa"       : `${this.inpPlaca1.toUpperCase()}-${this.inpPlaca2.toUpperCase()}`,
        "ano"         : this.inpAnoVeiculo,
        "marca"       : this.marcas[this.selectMarca].nomeMarca,
        "modelo"      : this.modelos[this.selectModelo].nomeModelo,
        "cilindrada"  : this.inpCilindradaVeiculo,
        "kmAtual"     : this.inpKmAtual,
        "ultimoKm"    : this.inpKmAtual
      }).then(ok => {
        load.dismiss()
        this.toastCadastroOk()
        this.toHome()
      }).catch(erro => {
        load.dismiss()
        console.log("erro")
      })
    }
  }

  async alertCamposVazios(){
    const alert = await this.alertCtrl.create({
      header: 'Ops...',
      subHeader: 'Favor, preencha todos os campos antes de continuar.',
      buttons:['Ok']
    })
    await alert.present()
  }

  async toastCadastroOk(){
    const toast = await this.toastCtrl.create({
      message: `Veículo ${this.inpPlaca1.toUpperCase()}-${this.inpPlaca2.toUpperCase()} cadastrado com sucesso!`,
      icon: 'checkmark-circle-outline',
      duration: 1500
    })
    await toast.present()
  }

}
