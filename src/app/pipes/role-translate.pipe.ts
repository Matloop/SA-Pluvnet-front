import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleTranslate',
  standalone: true // Importante para poder usar em outros componentes standalone
})
export class RoleTranslatePipe implements PipeTransform {

  /**
   * Transforma a role do backend (ex: 'OWNER') em um texto amigável.
   * @param value A role a ser transformada.
   * @returns O texto traduzido.
   */
  transform(value: string | undefined | null): string {
    if (!value) {
      return 'Função desconhecida'; // Retorno padrão se o valor for nulo ou indefinido
    }

    switch (value.toUpperCase()) {
      case 'OWNER':
        return 'Proprietário';
      case 'USER':
        return 'Usuário';
      // Você pode adicionar outras roles aqui no futuro
      // case 'ADMIN':
      //   return 'Administrador';
      default:
        return value; // Se não for nenhuma das conhecidas, retorna o valor original
    }
  }

}