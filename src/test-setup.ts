import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Minimal test environment for Angular standalone components
const testModule = {
  ngModule: class DynamicTestModule {},
  imports: [BrowserModule, NoopAnimationsModule],
  providers: [],
};

getTestBed().initTestEnvironment(BrowserModule, testModule);
