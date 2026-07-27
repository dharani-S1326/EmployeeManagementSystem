import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPayroll } from './my-payroll';

describe('MyPayroll', () => {
  let component: MyPayroll;
  let fixture: ComponentFixture<MyPayroll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPayroll],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPayroll);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
