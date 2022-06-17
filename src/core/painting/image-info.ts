export class ImageInfo {
  public author = "";

  public title = "";

  public updateTime: Date = new Date();

  public width = 0;

  public height = 0;

  public selectedLayerIndex = 0;

  public thumnailSize = 0;

  public imageSizes: number[] = [];

  public layerOpacities: number[] = [];
}
