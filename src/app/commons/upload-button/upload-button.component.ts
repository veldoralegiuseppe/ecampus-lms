import { HttpClient, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadButtonComponent {


  @Input() requiredFileType: string | undefined
  @Input() default: string = 'Nessun file caricato'
  fileName: string | undefined = undefined
  uploadProgress : number | null = null
  uploadSub : Subscription | null = null
  isCancelable : boolean = false
  @Output() onUploadComplete = new EventEmitter<any>()
  @Output() onUploadDelete = new EventEmitter<any>()
  @ViewChild('fileUpload') uploadButton!: ElementRef
  private _file: File | null = null
  
  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) {}

  uploadFile() {
    this.uploadButton.nativeElement.click()
    this.changeDetector.detectChanges()
  }

  onFileSelected(event : any) {
    const file:File = <File> event.target.files[0];
    console.log(file)
    

    if (file) {
      // identifico il file
      this.fileName = file.name;
      let fileType = file.type
      this._file = file
      this.isCancelable = true
      this.changeDetector.detectChanges()
    }

  }

  cancelUpload() {
    console.log(`cancelUpload`)
    this.uploadSub?.unsubscribe();
    this.reset();
  }

  reset() {
    console.log(`reset`)
    this.uploadProgress = null;
    this.uploadSub = null;
    this.fileName = undefined;
    this.isCancelable = false
    this.uploadButton.nativeElement.value = null
    this.onUploadDelete.emit(this.fileName)
    this.changeDetector.detectChanges()
  }

  sendFile(){
     
      // invio del file al backend
      if(!this._file) return
      const formData = new FormData();
      formData.append("thumbnail", this._file);
     
      const upload$ = this.http.post("/api/thumbnail-upload", formData, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        finalize(() => {
          this.isCancelable = true
          this.reset()
        })
     );

     this.uploadSub = upload$.subscribe(event => {
      if (event.type == HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * (event.loaded / event.total!));
      }
     })
  }

}
