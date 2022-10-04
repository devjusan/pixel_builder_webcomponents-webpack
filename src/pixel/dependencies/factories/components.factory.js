export class ComponentsFactory {
  static getComponentElement(typeName, props) {
    const element = document.createElement(typeName);
    element.setProps(props);

    if (window.IS_PIXEL_BUILDER_ENV) {
      element.classList.add('editor-component');
    }

    return element;
  }

  static getGridComponentElement(component) {
    const element = document.createElement(component.typeName);
    element.sync(component);

    if (window.IS_PIXEL_BUILDER_ENV) {
      element.setAttribute('editor-mocked', 'true');
      element.classList.add('editor-mocked-component');
    }

    return element;
  }
}
