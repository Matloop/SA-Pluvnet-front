import { Owner } from "./owner";

export interface Address {
  id : number,
  cep : string,
  logradouro : string,
  numero : string,
  complemento : string,
  bairro : string,
  cidade : string,
  uf : string,
  proprietario : Owner

}