import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroMapComponent } from './hero-map.component';

describe('HeroMapComponent', () => {
  let component: HeroMapComponent;
  let fixture: ComponentFixture<HeroMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
