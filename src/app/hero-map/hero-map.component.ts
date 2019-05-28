import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
declare var H: any;

@Component({
  selector: 'app-hero-map',
  templateUrl: './hero-map.component.html',
  styleUrls: ['./hero-map.component.css']
})
export class HeroMapComponent implements OnInit {

  @ViewChild("map")
    public mapElement: ElementRef;

    @Input()
    public appId: any;

    @Input()
    public appCode: any;

    @Input()
    public lat: any;

    @Input()
    public lng: any;

    @Input()
    public width: any;

    @Input()
    public height: any;

  constructor() { }

  ngOnInit() {
  }
  public ngAfterViewInit() {
    let platform = new H.service.Platform({
        "app_id": this.appId,
        "app_code": this.appCode
    });
    let defaultLayers = platform.createDefaultLayers();
    var map = new H.Map(
        this.mapElement.nativeElement,
        defaultLayers.normal.map,
        {
            zoom: 10,
            center: { lat: 52.31, lng: 13.4 }
        }
    );
    var circle=new H.map.Circle({lat:52.31,lng:13.4},80);
    map.addObject(circle);
}

}
