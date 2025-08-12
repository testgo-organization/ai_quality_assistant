export interface Task {
  id: string;
  status: string;
  // Agrega aquí los campos adicionales según tu modelo de BD
  [key: string]: any;
}
