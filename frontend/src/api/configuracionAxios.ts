import axios from 'axios'

// Configuración global de axios para interceptar respuestas 401 y refrescar token automáticamente
let estaRefrescandoToken = false
let colaPeticionesPendientes: Array<{ resolver: (valor?: any) => void; rechazar: (razon?: any) => void }> = []

const procesarCola = (error: any = null) => {
  colaPeticionesPendientes.forEach((promesa) => {
    if (error) {
      promesa.rechazar(error)
    } else {
      promesa.resolver()
    }
  })
  colaPeticionesPendientes = []
}

axios.interceptors.response.use(
  (respuesta) => respuesta,
  async (errorPeticion) => {
    const peticionOriginal = errorPeticion.config

    if (!errorPeticion.response || !peticionOriginal) {
      return Promise.reject(errorPeticion)
    }

    // Identificar rutas donde no se debe intentar refrescar token para evitar bucles
    const ruta = peticionOriginal.url || ''
    const esRutaAutenticacion =
      ruta.includes('/login/') ||
      ruta.includes('/registro/') ||
      ruta.includes('/token/refresh/')

    if (errorPeticion.response.status === 401 && !peticionOriginal._reintentado && !esRutaAutenticacion) {
      if (estaRefrescandoToken) {
        return new Promise((resolver, rechazar) => {
          colaPeticionesPendientes.push({ resolver, rechazar })
        })
          .then(() => axios(peticionOriginal))
          .catch((errorEnCola) => Promise.reject(errorEnCola))
      }

      peticionOriginal._reintentado = true
      estaRefrescandoToken = true

      try {
        await axios.post('/api/token/refresh/', {}, { withCredentials: true })
        procesarCola()
        return axios(peticionOriginal)
      } catch (errorRefresco) {
        procesarCola(errorRefresco)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(errorRefresco)
      } finally {
        estaRefrescandoToken = false
      }
    }

    return Promise.reject(errorPeticion)
  }
)
