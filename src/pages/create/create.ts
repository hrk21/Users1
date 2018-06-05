import { Component, ViewChild, NgZone, ElementRef, OnInit } from '@angular/core';
import { SignUpPage } from '../../pages/sign-up/sign-up';
import { HomePage } from '../../pages/home/home';
import { IonicPage, NavController, NavParams, ActionSheetController, App, ToastController, Platform, LoadingController, Loading, Segment } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
declare var cordova: any;
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Geolocation } from '@ionic-native/geolocation';
import { Base64 } from '@ionic-native/base64';
declare var google: any;
declare var MarkerClusterer: any;
/**
 * Generated class for the CreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreatePage {


  updatePage(CurrentScreen) {
    if (CurrentScreen == "S1") {
      if (this.mapElement) {
        if (this.searchbar1) {
          if (this.SourceString != "") {
            this.searchbar1.nativeElement.querySelector('.searchbar-input').value = this.SourceString;
          }
        }

        if (this.searchbar) {
          if (this.DestinationString != "") {
            this.searchbar.nativeElement.querySelector('.searchbar-input').value = this.DestinationString;
          }
        }
        this.loadMaps();

        this.findPath();


      }
      else { console.log("Fail to load"); }
    }
  }
  //MAPS VARS_______________________________________________________________________________________________________

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;
  @ViewChild('searchbar1', { read: ElementRef }) searchbar1: ElementRef;
  addressElement1: HTMLInputElement = null;
  Source: any = null;
  Destination: any = null;
  SourceString: string = "";
  DestinationString: string = "";
  MyLocation: any;
  listSearch: string = '';
  map: any;
  marker: any;
  loading: any;
  search: boolean = false;
  error: any;
  switch: string = "map";
  regionals: any = [];
  currentregional: any;
  //__________________________________________________________________________________________________________
  id: any;
  lastrecord: any;
  submitAttempt: boolean = false;
  p = SignUpPage;
  q = HomePage;
  CurrentScreen: string = "S1";
  lastImage1: string = null;
  IPath: string = null;
  Screen1: boolean;
  Screen2: boolean;
  Screen3: boolean;
  Screen4: boolean;
  Screen5: boolean;
  Screen6: boolean;
  Scr6: boolean = true;
  Global: boolean = true;
  distance: any;
  data: FormGroup;
  PackageName: AbstractControl;
  PackageDesc: AbstractControl;
  PickAddress: AbstractControl;
  DestAddress: AbstractControl;
  PackageSize: String;
  CourierType: String;
  VehicleType: String;
  TransportType: String;

  @ViewChild('signupSlider') signupSlider: any;
  @ViewChild('myInput') myInput: ElementRef;


  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private camera: Camera,
    private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController, public platform: Platform, public loadingCtrl: LoadingController, public http: Http,
    public geolocation: Geolocation, public app: App,
    public alertCtrl: AlertController, public zone: NgZone, private base64: Base64, private transfer: FileTransfer) {
    this.CurrentScreen = "S1";
    this.data = this.formBuilder.group({
      PackageName: ['', Validators.required],
      PackageDesc: ['', Validators.required],
      PickAddress: ['', Validators.required],
      DestAddress: ['', Validators.required],

    });

    this.PackageName = this.data.controls['PackageName'];
    this.PackageDesc = this.data.controls['PackageDesc'];
    this.PickAddress = this.data.controls['PickAddress'];
    this.DestAddress = this.data.controls['DestAddress'];

    this.presentLoadingDefault();

    // this.platform.ready().then(() => this.loadMaps());

  }
  //_________________GOOGLE MAPS________________________________________________________________________________________//
  viewPlace(id) {
    console.log('Clicked Marker', id);
  }

  presentLoadingDefault() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
      this.platform.ready().then(() => this.loadMaps());
    }, 4000);
  }

  loadMaps() {

    if (!!google) {

      this.initializeMap();
      this.initAutocomplete();
      console.log("Hello");

    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
  }

  errorAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.loadMaps();
          }
        }
      ]
    });
    alert.present();
  }

  mapsSearchBar(ev: any) {
    // set input to the value of the searchbar
    //this.search = ev.target.value;
    //    console.log(ev);
    const autocomplete = new google.maps.places.Autocomplete(ev);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          sub.next(place.geometry.location);
          sub.complete();
        }
      });
    });
  }

  initAutocomplete(): void {

    this.addressElement1 = this.searchbar1.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement1).subscribe((location) => {
      console.log('First Search', location);
      this.Source = new google.maps.LatLng(location.lat(), location.lng());
      let options = {
        center: location,
        zoom: 13
      };
      this.map.setOptions(options);
      this.addMarker(location, "Searched");

    });



    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Second Search', location);
      this.Destination = new google.maps.LatLng(location.lat(), location.lng());
      let options = {
        center: location,
        zoom: 13
      };
      this.map.setOptions(options);
      this.addMarker(location, "Searched");
    });

  }

  findPath() {

    this.SourceString = this.searchbar1.nativeElement.querySelector('.searchbar-input').value;
    this.DestinationString = this.searchbar.nativeElement.querySelector('.searchbar-input').value;
    if (this.SourceString != "" && this.DestinationString != "") {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();

      setTimeout(() => {
        loading.dismiss();
        // this.platform.ready().then(() => this.loadMaps());
        let directionsService = new google.maps.DirectionsService;
        let directionsDisplay = new google.maps.DirectionsRenderer;
        const map = new google.maps.Map(document.getElementById('map'), {
          zoom: 9,
          center: { lat: 41.85, lng: -87.65 }
        });
        directionsDisplay.setMap(map);
        directionsService.route({
          origin: this.Source,
          destination: this.Destination,
          travelMode: 'DRIVING'
        }, function (response, status) {
          if (status === 'OK') {
            this.distance = response.routes[0].legs[0].distance.value / 1000;
            console.log(response.routes[0].legs[0].distance.value / 1000);
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });


      }, 2000);
    }
    console.log("I am not the one");

  }

  findPath1() {
    console.log("Iam the one");
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
      // this.platform.ready().then(() => this.loadMaps());
      let directionsService = new google.maps.DirectionsService;
      let directionsDisplay = new google.maps.DirectionsRenderer;
      const map = new google.maps.Map(document.getElementById('map1'), {
        zoom: 9,
        center: { lat: 41.85, lng: -87.65 }
      });
      directionsDisplay.setMap(map);
      directionsService.route({
        origin: this.Source,
        destination: this.Destination,
        travelMode: 'DRIVING'
      }, function (response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });


    }, 2000);
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {

    {
      //  let locationOptions = { timeout: 10000, enableHighAccuracy: true };
      this.geolocation.getCurrentPosition().then(
        (position) => {
          console.log(position.coords.latitude, position.coords.longitude);
          let myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          //this.MyLocation= new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          let options = {
            center: myPos,
            zoom: 13
          };
          this.map.setOptions(options);
          this.addMarker(myPos, "I am Here!");


        },
        (error) => {
          this.loading.dismiss().then(() => {
            this.showToast('Location not found. Please enable your GPS!');
            console.log(error);
          });
        }
      )
    }

    const autocomplete = new google.maps.places.Autocomplete(addressEl);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          //console.log('Search', place.geometry.locat;
          console.log('Search Lat', place.geometry.location.lat());
          console.log('Search Lng', place.geometry.location.lng());
          sub.next(place.geometry.location);
          //sub.complete();
        }
      });
    });
  }

  initializeMap() {
    if (this.mapElement) {
      this.zone.run(() => {


        var mapEle = this.mapElement.nativeElement;

        this.map = new google.maps.Map(mapEle, {
          zoom: 12,
          center: { lat: 31.5360264, lng: 74.4069842 },
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          // styles: [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }],
          disableDoubleClickZoom: false,
          disableDefaultUI: true,
          zoomControl: true,
          scaleControl: true,
        });
        // this.getCurrentPosition();

      });
    }
  }

  //Center zoom
  //http://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
  bounceMap(markers) {
    let bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    this.map.fitBounds(bounds);
  }

  resizeMap() {
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 200);
  }

  /*
    getCurrentPositionfromStorage(markers) {
      this.storage.get('lastLocation').then((result) => {
        if (result) {
          let myPos = new google.maps.LatLng(result.lat, result.long);
          this.map.setOptions({
            center: myPos,
            zoom: 16
          });
          let marker = this.addMarker(myPos, "My last saved Location: " + result.location);
  
          markers.push(marker);
          this.bounceMap(markers);
  
          this.resizeMap();
        }
      });
    }
  */

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  // go show currrent location
  getCurrentPosition() {
    this.loading = this.loadingCtrl.create({
      content: 'Searching Location ...'
    });
    this.loading.present();

    let locationOptions = { timeout: 10000, enableHighAccuracy: true };

    this.geolocation.getCurrentPosition(locationOptions).then(
      (position) => {
        this.loading.dismiss().then(() => {

          this.showToast('Location found!');

          console.log(position.coords.latitude, position.coords.longitude);
          let myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          let options = {
            center: myPos,
            zoom: 12

          };
          this.map.setOptions(options);
          this.addMarker(myPos, "I am Here!");

        });
      },
      (error) => {
        this.loading.dismiss().then(() => {
          this.showToast('Location not found. Please enable your GPS!');

          console.log(error);
        });
      }
    )
  }

  toggleSearch() {
    if (this.search) {
      this.search = false;
    } else {
      this.search = true;
    }
  }

  addMarker(position, content) {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: position
    });

    this.addInfoWindow(marker, content);
    return marker;
  }

  addInfoWindow(marker, content) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }
  //_________________________________________________________________________________________________________________
  segmentchanged($event) {
    console.log(event);
  }

  // getpackage(){//try code
  //   this.http.get('http://localhost:5000/getpackageid').map(res => res.json()).subscribe(data => {

  //     this.lastrecord = data.content;
  //     console.log(data.content)
  //   err => {
  //       console.log('error');
  //   }});
  // }



  next() {
    if (this.CurrentScreen == "S3") {
      this.Screen3 = true;
      if (this.PackageSize != null && this.PackageName.value != "" && this.PackageDesc.value != "") {
        this.CurrentScreen = "S4";
      }
      return;
    }

    if (this.CurrentScreen == "S4") {
      this.Screen4 = true;
      if (this.TransportType != null) {
        this.CurrentScreen = "S5";
      }
      return;
    }

    if (this.CurrentScreen == "S5") {
      this.Screen5 = true;
      if (this.CourierType != null || this.VehicleType != null) {
        this.CurrentScreen = "S6";
        this.Scr6 = false;
        this.findPath1();
      }
      return;
    }

    if (this.CurrentScreen == "S1") {
      this.Screen1 = true;
      this.CurrentScreen = "S2";
      return;
    }
    if (this.CurrentScreen == "S2") {
      this.Screen2 = true;
      this.CurrentScreen = "S3";
      return;
    }
  }

  prev() {
    if (this.CurrentScreen == "S2") {
      this.CurrentScreen = "S1";

      return;
    }
    if (this.CurrentScreen == "S3") {
      this.CurrentScreen = "S2"
      return;
    }
    if (this.CurrentScreen == "S4") {
      this.CurrentScreen = "S3"
      return;
    }
    if (this.CurrentScreen == "S5") {
      this.CurrentScreen = "S4"
      return;
    }
    if (this.CurrentScreen == "S6") {
      this.CurrentScreen = "S5"
      return;
    }
  }

  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }
  save() {

  }
  public presentActionSheet(id) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 10,
      sourceType: sourceType,
      saveToPhotoAlbum: true,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            console.log(currentName);
            console.log(correctPath);
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        //this.lastImage1 = currentName;
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
      console.log(err);
    });
  }

  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage1 = newFileName;
      this.IPath = this.pathForImage(this.lastImage1);
    }, (error) => {
      this.presentToast('Error while storing file.');
      console.log(error);
    });
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }



  upload() {
    let fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: this.lastImage1,
      headers: {}

    }

    fileTransfer.upload(this.pathForImage(this.lastImage1), 'http://localhost:5000/imageupload', options, true)
      .then((data) => {
        console.log(data)
      }, (err) => {
        console.log(err)
      })
  }


  formSubmit() {
    this.upload();
    let Userdata;
    let Src = JSON.parse(JSON.stringify(this.Source));
    let Dst = JSON.parse(JSON.stringify(this.Destination));
    let SLat = Src["lat"];
    let SLng = Src["lng"];
    let DLat = Dst["lat"];
    let DLng = Dst["lng"];
    if (this.TransportType == 'Freelance') {
      Userdata = {
        'ID': 0,
        'PackageName': this.PackageName.value,
        'PackageDesc': this.PackageDesc.value,
        'PickAddress': this.SourceString,
        'DestAddress': this.DestinationString,
        'PackageSize': this.PackageSize,
        'TransportType': this.TransportType,
        'VehicleType': this.VehicleType,
        'SourceLongitude': SLng,
        'SourceLatitude': SLat,
        'DestinationLongitude': DLng,
        'DestinationLatitude': DLat,
        'TransporterID': null,
        'SenderID': 1,
        'Status': "Active",
        'PImage': this.lastImage1,
        'Fare': 0,
        'Distance':this.distance,
      };
    }
    else {
      Userdata = {
        'ID': 0,
        'PackageName': this.PackageName.value,
        'PackageDesc': this.PackageDesc.value,
        'PickAddress': this.SourceString,
        'DestAddress': this.DestinationString,
        'PackageSize': this.PackageSize,
        'TransportType': this.TransportType,
        'CourierType': this.CourierType,
        'SourceLongitude': Src["lng"],
        'SourceLatitude': Src["lat"],
        'DestinationLongitude': Dst["lng"],
        'DestinationLatitude': Dst["lat"],
        'TransporterID': null,
        'SenderID': 1,
        'Status': "Active",
        'PImage': this.lastImage1,
        'Fare': 0,
        'Distance':this.distance,
      };
    }


    console.log(Userdata);
    this.http.post('http://localhost:5000/createpackage', JSON.stringify(Userdata)).map(res => res.json()).subscribe(data => {
      let responseData = data;
      console.log(responseData);
    },
      err => {
        console.log(err);
      });
  }

}
