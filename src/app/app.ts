// mport { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
//
// @Component({
//   selector: 'app-root',
//   standalone: true,
//   // We import RouterOutlet so we can use <router-outlet> in the HTML
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.css'
// })
// export class AppComponent {
//   title = 'studybot-frontend';
// }

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <--- Import this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <--- Add this
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {}