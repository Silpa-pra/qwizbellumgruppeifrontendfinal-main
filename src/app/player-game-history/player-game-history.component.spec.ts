import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerGameHistoryComponent } from './player-game-history.component';

describe('PlayerGameHistoryComponent', () => {
  let component: PlayerGameHistoryComponent;
  let fixture: ComponentFixture<PlayerGameHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerGameHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerGameHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
