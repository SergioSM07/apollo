import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string | null | undefined, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl | null {
    if (url === null || url === undefined) {
      return null;
    }

    switch (type) {
      case 'html': return this.sanitizer.bypassSecurityTrustHtml(url);
      case 'style': return this.sanitizer.bypassSecurityTrustStyle(url);
      case 'script': return this.sanitizer.bypassSecurityTrustScript(url);
      case 'url': return this.sanitizer.bypassSecurityTrustUrl(url);
      case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      default: return this.sanitizer.bypassSecurityTrustHtml(url); // Valor por defecto
    }
  }

}
