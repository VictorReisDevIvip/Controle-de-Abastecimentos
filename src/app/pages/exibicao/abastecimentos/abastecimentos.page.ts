import { getDocs, collection, getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MenuController, NavController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-abastecimentos',
  templateUrl: './abastecimentos.page.html',
  styleUrls: ['./abastecimentos.page.scss'],
})
export class AbastecimentosPage implements OnInit {

  constructor(
    public menuCtrl : MenuController, 
    public navCtrl : NavController,
    public actionSheetCtrl : ActionSheetController,
    public alertCtrl : AlertController,
    public loadCtrl : LoadingController) { }

  auth = getAuth()
  email : string
  veiculos : any[]
  medias : any[] = []
  selectVeiculoExibeAbast : string


  ngOnInit() {
    this.menuCtrl.enable(true)
    onAuthStateChanged(this.auth, usuario => {
      this.email = usuario.email
      this.carregarVeiculos()
    })
  }

  async carregarVeiculos(){
    const load = await this.loadCtrl.create({
      message : 'Carregando seus veículos...'
    })
    load.present()
    var i = 0
    this.veiculos = []
    const consulta = await getDocs(collection(getFirestore(), `users/${this.email}/veiculos`))
    if(!consulta.empty){
      consulta.forEach( doc => {
        this.veiculos[i] = {
          id      : doc.id,
          indice  : i,
          placa   : doc.get('placa'),
          modelo  : doc.get('modelo')
        }
        console.log(this.veiculos[i])
        i++
      })
      load.dismiss()
      }else{
        load.dismiss()
        this.actionSheetSemVeiculos()
      }
    }

    async actionSheetSemVeiculos(){
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Sem veículos...',
        subHeader: 'Você não tem veículos cadastrados, deseja cadastrar agora?',
        buttons: [{
          text: 'Sim!',
          handler: () => {
            this.navCtrl.navigateForward('cadastro-veiculos');
          }
        },{
          text: 'Mais tarde.',
          handler: () => {
            this.navCtrl.navigateForward('home')
          }
        }]
      })

      await actionSheet.present()
    }

  async carregarMedias(){
    const load = await this.loadCtrl.create({
      message : 'Carregando abastecimentos...'
    })
    load.present()
    var i = 0
    this.medias = []
    const consulta = await getDocs(collection(getFirestore(), `users/${this.email}/medias`))
    consulta.forEach( doc => {
      if (doc.get('placa') == this.selectVeiculoExibeAbast){
        this.medias[i] = doc.data()
        console.log(this.medias[i])
        i++
      }
    })
    load.dismiss()
    if (i == 0) {
      this.alertSemAbastecimentos()
    }
  }

  async alertSemAbastecimentos(){
    const alert = await this.alertCtrl.create({
      header : 'Ops...',
      message : 'O Veículo selecionado não possui abastecimentos',
      buttons : ['Ok']
    })
    alert.present()
  }

  toHome(){
    this.navCtrl.navigateForward('home')
  }
}
