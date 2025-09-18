# Configuración de Timezone - América/Guayaquil

## Cambios Realizados

Se ha configurado el proyecto para que todos los logs y timestamps se muestren en la zona horaria de **América/Guayaquil** en lugar de UTC.

### Archivos Modificados

1. **`package.json`**
   - Se agregó la dependencia `moment-timezone` para manejo de zonas horarias
   - Se agregó `@types/moment-timezone` como dependencia de desarrollo

2. **`src/core/config.ts`**
   - Se agregó la configuración `timezone: 'America/Guayaquil'`
   - Permite configurar via variable de entorno `TIMEZONE`

3. **`src/utils/logger.ts`**
   - Modificado para usar timestamps en timezone local
   - Los logs ahora muestran formato: `YYYY-MM-DD HH:mm:ss` en América/Guayaquil

4. **`src/utils/date-utils.ts`**
   - Actualizado para usar timezone local en todas las operaciones de fecha
   - Métodos actualizados: `getModifiedDate()`, `getCurrentDate()`, `formatDateForTitle()`

5. **`src/utils/handler-date.ts`**
   - Función `obtenerFechaModificada()` ahora usa timezone local

6. **`src/runners/runFacturasFull.ts`**
   - Variable `EXPORT_DATE` ahora usa timezone local

### Nuevo Archivo

7. **`src/utils/timezone-utils.ts`** (NUEVO)
   - Utilidades centralizadas para manejo de timezone
   - Clase `TimezoneUtils` con métodos para conversión y formateo
   - Funciones de conveniencia para compatibilidad

8. **`src/test/test-timezone.ts`** (NUEVO)
   - Archivo de prueba para verificar el funcionamiento del timezone

## Uso

### Logger
```typescript
import { Logger } from './utils/logger';

const logger = new Logger('MI_COMPONENTE');
logger.info('Este log aparecerá con timestamp de América/Guayaquil');
// Output: ℹ️ [2025-09-18 10:30:45] [MI_COMPONENTE] Este log aparecerá con timestamp de América/Guayaquil
```

### Utilidades de Fecha
```typescript
import { TimezoneUtils } from './utils/timezone-utils';
import { DateUtils } from './utils/date-utils';

// Obtener timestamp actual
const timestamp = TimezoneUtils.getTimestamp(); // "2025-09-18 10:30:45"

// Obtener fecha actual
const dateUtils = new DateUtils();
const currentDate = dateUtils.getCurrentDate(); // "2025-09-18"

// Convertir UTC a local
const utcDate = "2025-09-18T15:30:45.000Z";
const localDate = TimezoneUtils.formatUtcToLocal(utcDate); // "2025-09-18 10:30:45"
```

## Configuración

La zona horaria se puede configurar mediante la variable de entorno `TIMEZONE`:

```bash
# .env
TIMEZONE=America/Guayaquil
```

Si no se especifica, por defecto se usa `America/Guayaquil`.

## Verificación

Para verificar que los cambios funcionan correctamente, ejecutar:

```bash
npx ts-node src/test/test-timezone.ts
```

Este comando mostrará la información de timezone y ejemplos de timestamps en la zona horaria configurada.

## Impacto

- **Logs**: Ahora todos los logs muestran timestamps en América/Guayaquil
- **Archivos de Export**: Los nombres de archivos con fecha usan timezone local
- **Fechas en Títulos**: Las fechas en títulos de tickets/reportes usan timezone local
- **Compatibilidad**: Mantiene compatibilidad hacia atrás con código existente

## Zona Horaria Ecuador

**América/Guayaquil** corresponde a:
- **UTC-5** (Ecuador Continental)
- **Sin cambio de horario estacional** (no hay horario de verano)
- **Incluye**: Ecuador continental (Quito, Guayaquil, Cuenca, etc.)

## Notas Técnicas

- Se usa `moment-timezone` para manejo robusto de zonas horarias
- Todos los timestamps internos siguen siendo UTC para consistencia
- Solo se cambia la presentación/visualización al usuario
- Las operaciones de base de datos no se ven afectadas