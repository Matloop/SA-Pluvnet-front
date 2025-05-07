import { Address } from "./address";

export interface Owner{
  id : number,
  nome : string,
  email : string,
  telefone : string,
  enderecos : Address[]
}
