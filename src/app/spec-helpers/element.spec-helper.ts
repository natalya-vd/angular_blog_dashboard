import { DebugElement } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

export function findEl<T>(
  fixture: ComponentFixture<T>,
  testId: string
): DebugElement {
  return fixture.debugElement.query(
    By.css(`[data-testid="${testId}"]`)
  );
}
export function findEls<T>(
  fixture: ComponentFixture<T>,
  testId: string
): DebugElement[] {
  return fixture.debugElement.queryAll(
    By.css(`[data-testid="${testId}"]`)
  );
}

export function click<T>(
  fixture: ComponentFixture<T>,
  testId: string
): void {
  const element = findEl(fixture, testId);
  const event = makeClickEvent(element.nativeElement);
  element.triggerEventHandler('click', event);
}

export function makeClickEvent(
  target: EventTarget
): Partial<MouseEvent> {
  return {
    preventDefault(): void {},
    stopPropagation(): void {},
    stopImmediatePropagation(): void {},
    type: 'click',
    target,
    currentTarget: target,
    bubbles: true,
    cancelable: true,
    button: 0
  };
}

export function uploadFile<T>(
  file: File,
  fixture: ComponentFixture<T>,
  testId: string
  ) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const element = findEl(fixture, testId);
    const inputFile: HTMLInputElement = element.nativeElement;
    inputFile.files = dataTransfer.files;

    dispatchFakeEvent(inputFile, 'input')
}

export function setFieldElementValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  element.value = value;

  const isSelect = element instanceof HTMLSelectElement;
  dispatchFakeEvent(element, isSelect ? 'change' : 'input', isSelect ? false : true);
}

export function dispatchFakeEvent(
  element: EventTarget,
  type: string,
  bubbles: boolean = false,
): void {
  element.dispatchEvent(new Event(type, {bubbles, cancelable: false}));
}

export function setFieldValue<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  value: string,
): void {
  setFieldElementValue(
    findEl(fixture, testId).nativeElement,
    value
  );
}

export function expectText<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  text: string,
): void {
  const element = findEl(fixture, testId);
  const actualText = element.nativeElement.textContent;
  expect(actualText).toBe(text);
}

export function markFieldAsTouched (element: DebugElement) {
  dispatchFakeEvent(element.nativeElement, 'blur');
};
