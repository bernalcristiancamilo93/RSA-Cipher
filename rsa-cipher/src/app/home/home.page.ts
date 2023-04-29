import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Alfabeto
  public alfabeto = [
    { value: 'a', checked: true },
    { value: 'b', checked: true },
    { value: 'c', checked: true },
    { value: 'd', checked: true },
    { value: 'e', checked: true },
    { value: 'f', checked: true },
    { value: 'g', checked: true },
    { value: 'h', checked: true },
    { value: 'i', checked: true },
    { value: 'j', checked: true },
    { value: 'k', checked: true },
    { value: 'l', checked: true },
    { value: 'm', checked: true },
    { value: 'n', checked: true },
    { value: 'ñ', checked: true },
    { value: 'o', checked: true },
    { value: 'p', checked: true },
    { value: 'q', checked: true },
    { value: 'r', checked: true },
    { value: 's', checked: true },
    { value: 't', checked: true },
    { value: 'u', checked: true },
    { value: 'v', checked: true },
    { value: 'w', checked: true },
    { value: 'x', checked: true },
    { value: 'y', checked: true },
    { value: 'z', checked: true },
    { value: '0', checked: false },
    { value: '1', checked: false },
    { value: '2', checked: false },
    { value: '3', checked: false },
    { value: '4', checked: false },
    { value: '5', checked: false },
    { value: '6', checked: false },
    { value: '7', checked: false },
    { value: '8', checked: false },
    { value: '9', checked: false },
  ];

  // Form
  public rsaForm: FormGroup = new FormGroup({
    numeroLetrasPorBloque: new FormControl(2, Validators.required),
    selectorFuncion: new FormControl('cifrar', Validators.required),
    claveP: new FormControl(null, Validators.required),
    claveQ: new FormControl(null, Validators.required),
    claveE: new FormControl(null, Validators.required),
    claveD: new FormControl(null),
    claveN: new FormControl(null),
    clavePhiN: new FormControl(null),
    mensajePlano: new FormControl('', Validators.required),
    mensajeFormateado: new FormControl(null),
    mensajeFinal: new FormControl(null),
  });

  constructor(private alertCtrl: AlertController) {}

  generarClaves(): void {
    if (!this.numLetrasPorBloqueCorrecto()) {
      this.alertCtrl
        .create({
          header: '¡Error!',
          message: 'El número de letras por bloque es incorrecto.',
          buttons: ['Okay'],
        })
        .then((alertElement) => {
          alertElement.present();
        });
      return;
    }

    const claveP: number = this.rsaForm.get('claveP')?.value;
    const claveQ: number = this.rsaForm.get('claveQ')?.value;
    const claveE: number = this.rsaForm.get('claveE')?.value;

    if (claveP == null || claveQ == null || claveE == null) {
      this.alertCtrl
        .create({
          header: '¡Error!',
          message: 'Ingrese las claves completas',
          buttons: ['Okay'],
        })
        .then((alertElement) => {
          alertElement.present();
        });
      return;
    }

    if (!this.esPrimo(claveP) || !this.esPrimo(claveQ)) {
      return;
    }

    // Verificar que N esté dentro de z^n y z^n+1
    const numeroN: number = claveP * claveQ;
    const numeroPhiN: number = (claveP - 1) * (claveQ - 1);
    const letrasPorBloque: number = this.rsaForm.get(
      'numeroLetrasPorBloque'
    )?.value;
    const zMin = Math.pow(this.totalLetrasAlfabeto(), letrasPorBloque);
    const zMax = Math.pow(this.totalLetrasAlfabeto(), letrasPorBloque + 1);

    console.log(numeroN);
    console.log(zMin);
    console.log(zMax);

    if (!(zMin < numeroN && numeroN < zMax)) {
      this.alertCtrl
        .create({
          header: '¡Error!',
          message: `N no cumple la igualdad. Seleccione un número de letras por
            bloque distinto.`,
          buttons: ['Okay'],
        })
        .then((alertElement) => {
          alertElement.present();
        });
      return;
    }

    // Verificación de clave E
    if (claveE >= numeroN || claveE <= 1) {
      this.alertCtrl
        .create({
          header: '¡Error!',
          message: 'El valor de e no es permitido',
          buttons: ['Okay'],
        })
        .then((alertElement) => {
          alertElement.present();
        });
      return;
    }

    for (let i = 2; i < claveE; i++) {
      if (claveE % i === 0 && numeroPhiN % i === 0) {
        this.alertCtrl
          .create({
            header: '¡Error!',
            message: 'El valor de e no es primo relativo de Phi(N)',
            buttons: ['Okay'],
          })
          .then((alertElement) => {
            alertElement.present();
          });
        return;
      }
    }

    // Cálculo de clave D
    let claveD = 0;
    for (let i = 1; i < numeroPhiN; i++) {
      if ((i * numeroPhiN + 1) % claveE === 0) {
        claveD = (i * numeroPhiN + 1) / claveE;
        break;
      }
    }

    this.rsaForm.get('claveD')?.patchValue(claveD);
    this.rsaForm.get('claveN')?.patchValue(numeroN);
    this.rsaForm.get('clavePhiN')?.patchValue(numeroPhiN);
  }

  // Tomado de https://en.wikipedia.org/wiki/Primality_test#:~:text=true%3B%0A%20%20%20%20%7D-,JavaScript,-%5Bedit%5D
  esPrimo(numero: number): boolean {
    if (numero === 2 || numero === 3) {
      return true;
    }

    if (numero <= 1 || numero % 2 == 0 || numero % 3 == 0) {
      this.alertaPrimo(numero);
      return false;
    }

    for (let i = 5; i * i < numero; i += 6) {
      if (numero % i == 0 || numero % (i + 2) == 0) {
        this.alertaPrimo(numero);
        return false;
      }
    }

    return true;
  }

  alertaPrimo(numero: number) {
    this.alertCtrl
      .create({
        header: '¡Error!',
        message: `${numero} no es un número primo`,
        buttons: ['Okay'],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }

  totalLetrasAlfabeto(): number {
    let total = 0;
    for (let caracter of this.alfabeto) {
      if (caracter.checked) total++;
    }
    return total;
  }

  calcular() {
    const proceso = this.rsaForm.get('selectorFuncion')?.value;
    const claveE: number = this.rsaForm.get('claveE')?.value;
    const claveN: number = this.rsaForm.get('claveN')?.value;
    const claveD: number = this.rsaForm.get('claveD')?.value;

    if (proceso === 'cifrar' && claveE !== null && claveN !== null) {
      if (!this.numLetrasPorBloqueCorrecto()) {
        this.alertCtrl
          .create({
            header: '¡Error!',
            message: 'El número de letras por bloque es incorrecto.',
            buttons: ['Okay'],
          })
          .then((alertElement) => {
            alertElement.present();
          });
        return;
      }
      let arrayTexto = this.rsaForm.get('mensajePlano')?.value;
      if (arrayTexto === null || arrayTexto === '') {
        return;
      }

      // Quita los espacios, acentos, signos de puntuación y pasa todo a mayúsculas.
      arrayTexto = this.rsaForm
        .get('mensajePlano')
        ?.value.toUpperCase()
        .replace(/\s/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()!¡¿?]/g, '');

      // Calcula el número de letras necesario para completar el bloque.
      const numeroLetrasPorBloque: number = this.rsaForm.get(
        'numeroLetrasPorBloque'
      )?.value;

      if (arrayTexto.length % numeroLetrasPorBloque !== 0) {
        const fit =
          numeroLetrasPorBloque - (arrayTexto.length % numeroLetrasPorBloque);

        // Llena con la última letra o con X.
        // const char = arrayTexto.charAt(arrayTexto.length - 1);
        const char = 'X';

        for (let i = 0; i < fit; i++) {
          arrayTexto += char;
        }
      }

      this.rsaForm.get('mensajeFormateado')?.patchValue(arrayTexto);

      // Verificar que N esté dentro de z^n y z^n+1
      const zMin = Math.pow(this.totalLetrasAlfabeto(), numeroLetrasPorBloque);
      const zMax = Math.pow(
        this.totalLetrasAlfabeto(),
        numeroLetrasPorBloque + 1
      );

      if (claveN <= zMin || claveN >= zMax) {
        this.alertCtrl
          .create({
            header: '¡Error!',
            message: `N no cumple la igualdad. Seleccione un número de letras por
            bloque distinto.`,
            buttons: ['Okay'],
          })
          .then((alertElement) => {
            alertElement.present();
          });
        return;
      }

      this.cifrado();
    } else if (proceso === 'descifrar' && claveD !== null && claveN !== null) {
      this.descifrado();
    } else {
      this.alertCtrl
        .create({
          header: '¡Error!',
          message: 'Ingrese las claves.',
          buttons: ['Okay'],
        })
        .then((alertElement) => {
          alertElement.present();
        });
      return;
    }

    // console.log(this.calculoExponenteModulo(1621,151,2419));
  }

  cifrado() {
    // Se fragmenta el mensaje en caracteres individuales
    const mensajeParticionado: string[] = this.rsaForm
      .get('mensajeFormateado')
      ?.value.split('');

    // Se asigna un peso a cada letra
    let mensajeConPesos: number[] = [];

    for (const letra of mensajeParticionado) {
      mensajeConPesos.push(this.asignarPeso(letra));
    }

    // Se concatenan los pesos
    let pesosEnBloque: number[] = [];
    const letrasPorBloque: number = this.rsaForm.get(
      'numeroLetrasPorBloque'
    )?.value;

    for (let i = 0; i < mensajeConPesos.length; i += letrasPorBloque) {
      let valorConcatenado = '';
      for (let j = 0; j < letrasPorBloque; j++) {
        valorConcatenado += mensajeConPesos[i + j];
      }
      pesosEnBloque.push(+valorConcatenado);
    }

    // Se calcula el cifrado para cada peso en bloque
    let pesosCifrados: number[] = [];
    const claveE: number = this.rsaForm.get('claveE')?.value;
    const claveN: number = this.rsaForm.get('claveN')?.value;
    for (const bloque of pesosEnBloque) {
      pesosCifrados.push(this.calculoExponenteModulo(bloque, claveE, claveN));
    }

    // Se extrae la letra de cada peso cifrado
    let mensajeCifradoFinal: string[] = [];

    for (const bloque of pesosCifrados) {
      // console.log(bloque.toString().split(''));
    }

    this.rsaForm.get('mensajeFinal')?.patchValue(pesosCifrados);
  }

  descifrado() {
    // Se fragmenta el mensaje en caracteres individuales
    const mensajeParticionado: string[] = this.rsaForm
      .get('mensajePlano')
      ?.value.split(',');

    console.log('mensajeParticionado', mensajeParticionado);

    // Se calcula el cifrado para cada peso en bloque
    let pesosCifrados: number[] = [];
    const claveD: number = this.rsaForm.get('claveD')?.value;
    const claveN: number = this.rsaForm.get('claveN')?.value;
    for (const bloque of mensajeParticionado) {
      pesosCifrados.push(this.calculoExponenteModulo(+bloque, claveD, claveN));
    }

    console.log('pesosCifrados', pesosCifrados);

    this.rsaForm.get('mensajeFinal')?.patchValue(pesosCifrados);
  }

  asignarPeso(letra: string): number {
    return this.letrasActivas().findIndex(
      (array) => array.value.toUpperCase() === letra
    );
  }

  letrasActivas() {
    return this.alfabeto.filter((array) => array.checked === true);
  }

  numLetrasPorBloqueCorrecto() {
    return this.rsaForm.get('numeroLetrasPorBloque')?.value > 0;
  }

  calculoExponenteModulo(
    mensaje: number,
    claveE: number,
    claveN: number
  ): number {
    if (claveN === 1) {
      return 0;
    }
    let resultado = 1;
    for (let i = 0; i < claveE; i++) {
      resultado = (resultado * mensaje) % claveN;
    }
    return resultado;
  }
}
