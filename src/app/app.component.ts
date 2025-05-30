import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedFile: File|null = null;
  key: string = '';
  loading = false;
  private http = inject(HttpClient);

  onFileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    this.selectedFile = input?.files?.[0]||null;

  }

  encrypt(){
    if(!this.selectedFile||!this.key) return alert('File and key required');
    this.sendFile('encrypt');
  }

  decrypt(){
    if(!this.selectedFile||!this.key) return alert('File and key required');
    this.sendFile('decrypt');
  }

  private sendFile(mode: 'encrypt'|'decrypt'){
    const formData = new FormData();
    formData.append('file',this.selectedFile!);
    formData.append('key',this.key);
    this.loading=true;

      this.http.post(`https://file-encrypter-production.up.railway.app/api/${mode}`, formData, {
        responseType: 'blob',
        observe: 'response' // so we can read headers
        }).subscribe(response => {
          const blob = response.body!;
          const contentDisposition = response.headers?.get('content-disposition');
          const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
          const filename = filenameMatch?.[1] || this.selectedFile!.name;
          console.log('Content-Disposition:', contentDisposition);

          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          a.click();
          this.loading = false;
        }, error => {
            this.loading = false;
            if (error.error instanceof Blob) {
              const reader = new FileReader();
              reader.onload=()=>{
                const errorText = reader.result as string;
                alert('Error: '+errorText);
              };
              reader.readAsText(error.error);
            }
            else {
              alert('Error: '+error.message||error.statusText);
            }

          });




  }

  title = 'EncryptionApp';
}
