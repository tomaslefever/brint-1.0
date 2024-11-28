import PocketBase from 'pocketbase'

// Inicializa PocketBase
const pb = new PocketBase('http://127.0.0.1:8090')

// Exporta la instancia de PocketBase
export { pb }

// Opcionalmente, puedes exportar tipos útiles de PocketBase
export type {
  RecordModel,
  RecordSubscription,
  UnsubscribeFunc,
  RecordAuthResponse,
  AdminAuthResponse,
  RecordService,
  BaseAuthStore,
} from 'pocketbase'
