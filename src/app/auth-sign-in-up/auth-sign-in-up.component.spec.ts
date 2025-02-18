import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignInUpComponent } from './auth-sign-in-up.component';

describe('AuthSignInUpComponent', () => {
  let component: AuthSignInUpComponent;
  let fixture: ComponentFixture<AuthSignInUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSignInUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSignInUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
