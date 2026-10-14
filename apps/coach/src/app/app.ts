import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from '@openng/optimus-ui/confirmdialog';
import { Toast } from '@openng/optimus-ui/toast';

@Component({
  imports: [RouterOutlet, Toast, ConfirmDialog],
  selector: 'coach-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
}
