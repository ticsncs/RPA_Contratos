import { login } from './core/login';
import { interactWithElement } from './utils/handler-elements';
//import pLimit from 'p-limit';

import { UserData, TicketData } from './core/interfaces/interface-ticket';

/**
 * Función para ejecutar la automatización con parámetros dinámicos
 * @param {string} searchText - Texto a buscar en el sistema
 * @param {object} ticketData - Datos para rellenar el ticket
 */
export async function runAutomation(searchText: string, ticketData: TicketData) {
  try {
    console.time('Tiempo de ejecución');
    console.log('🔗 Navegando a la página de inicio de sesión...');
    
    // Iniciar sesión en el sistema
    const { browser, page } = await login(true);

    const interactSafely = async (selector: string, action: string, options: object = {}) => {
      try {
        await interactWithElement(page, selector, action='wait', options);
      } catch (error) {
        console.error(`❌ Error en el paso: ${selector} - Acción: ${action}`);
        await browser.close();
        throw new Error(`Proceso detenido debido a fallo en ${selector}`);
      }
    };

    // 🔹 Esperar a que cargue la lista de registros
    console.log('⏳ Esperando carga de la lista de registros...');
    await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 3000 });

    // 🔹 Búsqueda de registro
    console.log(`🔍 Buscando registro: ${searchText}...`);
    await interactWithElement(page, '[placeholder="Búsqueda..."]', 'fill', { text: searchText });
    await interactWithElement(page, '[placeholder="Búsqueda..."]', 'press', { key: 'Enter' });
    await interactWithElement(page, '[placeholder="Búsqueda..."]', 'wait', { waitTime: 2000 });

    // 🔹 Esperar a que cargue el registro y abrirlo
    await interactWithElement(page, `td:has-text("${ticketData.user}")`, 'wait', { waitTime: 2000 });
    await interactWithElement(page, `td:has-text("${ticketData.user}")`, 'doubleClick');
    await interactWithElement(page, `td:has-text("${ticketData.user}")`, 'wait', { waitTime: 2000 });

    // 🔹 Crear Ticket
    console.log('🎫 Creando ticket...');

    await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'doubleClick');
    await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'wait', { waitTime: 5000 });

    // 🔹 Editar el Ticket
    await interactWithElement(page, 'button:has-text("Editar")', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'button:has-text("Editar")', 'doubleClick');
    await interactWithElement(page, 'button:has-text("Editar")', 'wait', { waitTime: 5000 });


    // 🔹 Rellenar los campos del ticket con los datos proporcionados
    console.log('📝 Rellenando campo de título del ticket...');
    await interactWithElement(page, '.o_group', 'wait', { waitTime: 3000 });
    
    // Interactuar con el campo "Título"
    await interactWithElement(page, 'input[name="name"]', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'input[name="name"]', 'fill', { text: ticketData.title });

    // Interactuar con el campo "Equipo"
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'wait', { waitTime: 2000 });
    const team = await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'fill', { text: ticketData.team });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'click');
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'ArrowDown' });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'Enter' });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'wait', { waitTime: 5000 });


    // Interactuar con el campo "Usuario asignado"
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'wait', { waitTime: 2000 });
    const userAsigned = await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'fill', { text: ticketData.assignedUser });
    await interactWithElement(page, `li.ui-menu-item:has-text("${ticketData.assignedUser}")`, 'click');
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input',  'wait', { waitTime: 5000 });
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'click');
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input',  'wait', { waitTime: 5000 });

    // Interactuar con el campo "Canal"
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'wait', { waitTime: 2000 });
    const userChannel = await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'fill', { text: ticketData.channel });
    await interactWithElement(page, `li.ui-menu-item:has-text("${ticketData.channel}")`, 'click');
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'wait', { waitTime: 5000 });
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'press', { key: 'Enter' });
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'wait', { waitTime: 5000 });

    // Interactuar con el campo "Categoría"
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
    const category=await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'fill', { text: ticketData.category });
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'press', { key: 'Enter' });
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });

    // Interactuar con el campo "Etiqueta"
    if (ticketData.tag && ticketData.tag.trim() !== '') {
      await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'wait', { waitTime: 2000 });
      await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'fill', { text: ticketData.tag });
      await interactWithElement(page, `li.ui-menu-item:has-text("${ticketData.tag}")`, 'click');
      await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'wait', { waitTime: 2000 });
      await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'press', { key: 'Enter' });
      await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'wait', { waitTime: 2000 });
    } 

    // Guardar ticket
    console.log('💾 Guardando ticket...');
    const btnGuardar = await interactWithElement(page, 'button.btn:has-text("Guardar")', 'click');
    await page.waitForTimeout(2000);

  
    await browser.close();
    if (btnGuardar || category || userChannel || userAsigned || team) {
      return true;
    } else {
      return false;
      console.error('❌ Error al crear el ticket - No se han rellenado los campos correctamente del usuario:', searchText);
      
    }

  } catch (error) {
    console.error('❌ Error durante la automatización:', error);
  } finally {
    console.timeEnd('Tiempo de ejecución');
  }
}

/**
 * Función para ejecutar múltiples robots en paralelo con datos dinámicos
 * @param {Array} usersData - Lista de datos para cada ejecución
 * @param {number} concurrency - Número de ejecuciones en paralelo
 */


/*
export async function runRobotsInParallel(usersData: UserData[], concurrency: number) {
  const limit = pLimit(concurrency);

  console.time('Tiempo total de ejecución');

  const promises = usersData.map((userData, i) =>
    limit(async () => {
      const delay = Math.random() * (40000 - 30000) + 30000; // Entre 30 y 40 segundos
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`Iniciando robot para el usuario ${i + 1}`);
      await runAutomation(userData.searchText, userData.ticketData);
      await new Promise(resolve => setTimeout(resolve, 30000));
      console.log(`Robot para el usuario ${i + 1} completado`);
    })
  );

  await Promise.all(promises);

  console.timeEnd('Tiempo total de ejecución');
}
*/

