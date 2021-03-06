import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  activedata: any;
  id: any;
  name: any;
  phoneno: any;
  email: any;
  address: any;
  image: any;
  setValues: Boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public storage: Storage) {
    this.getData().then(() => {
      this.setValues = true;
    })

  }
  getData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get('ID').then((val) => {
        this.id = val;
        console.log('ID is +',this.id);
        this.http.get('http://localhost:5000/senderprofile', { params: { 'SenderID': this.id } }).map(res => res.json()).subscribe(data => {
          this.activedata = data;
          console.log(this.activedata);
          this.name = data.content[0].Name;
          this.phoneno = data.content[0].Phone;
          this.email = data.content[0].Email;
          this.address = data.content[0].Address;
          this.image = data.content[0].ProfilePicture;
          resolve();
        },
          (err) => {
            console.log(err);
          });
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  getProfile(id) {

  }

}
