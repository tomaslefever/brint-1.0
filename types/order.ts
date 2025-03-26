import { Customer } from "./customer";
import { User } from "./users";
import { Activity } from "./activity";
import { File } from "./files";
import { Proposal } from "./proposal";

export type Order = {
  id: string;
  created: string;
  expand: {
    created_by: User;
    customer: Customer;
    activity: Activity[];
    model3d: File[];
    fotografiasPaciente: File[];
    fotografiasAdicionales: File[];
    imagenesRadiologicas: File[];
    coneBeam: File[];
  };
  updated: string;
  nombre: string;
  status: string | "pending" | "working" | "canceled" | "complete" | "paused";
  customer: Customer;
  activity: Activity[];
  maxilarSuperior: {
    alineacionCompleta: boolean;
    alineacionParcial: boolean;
    nivelacion: string;
    strippingEntreDientes: string;
    expansion: string;
    retroinclinacionORetraccion: string;
    proinclinacionOProtraccion: string;
    extrusionDeDientes: string;
    intrusionDeDientes: string;
    cerrarEspacioEntreDientes: string;
    cerrarLineaMedia: string;
  };
  mandibula: {
    alineacionCompleta: boolean;
    alineacionParcial: boolean;
    nivelacion: string;
    strippingEntreDientes: string;
    expansion: string;
    retroinclinacionORetraccion: string;
    proinclinacionOProtraccion: string;
    extrusionDeDientes: string;
    intrusionDeDientes: string;
    cerrarEspacioEntreDientes: string;
    cerrarLineaMedia: string;
  };
  metodoEntregaModelo: string;
  direccionRetiro: string;
  comunaRetiro: string;
  fechaRetiro: string;
  horaRetiro: string;
  model3d: File[];
  fotografiasPaciente: File[];
  fotografiasAdicionales: File[];
  imagenesRadiologicas: File[];
  coneBeam: File[];
  proposal: Proposal;
  tipoImagenRadiologica: string;
};
