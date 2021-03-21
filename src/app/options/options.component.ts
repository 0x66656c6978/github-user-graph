import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  optionsForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    const personalAccessToken = localStorage.getItem('personalAccessToken') || '';
    const githubUsername = localStorage.getItem('githubUsername') || '';
    this.optionsForm = new FormGroup({
      personalAccessToken: new FormControl(personalAccessToken, Validators.pattern(/[a-f0-9]+/)),
      githubUsername: new FormControl(githubUsername, Validators.pattern(/[a-f0-9]+/)),
    });
  }

  onSubmit(formData): void {
    localStorage.setItem('personalAccessToken', formData.personalAccessToken);
    localStorage.setItem('githubUsername', formData.githubUsername);
  }

}
