import { login } from './core/login';
import { interactWithElement } from './utils/handler-error';
import { downloadFile } from './utils/handler-files';

async function runAutomation() {

  try {
    // 🔹 Navegar a la página e iniciar sesión
    console.log('🔗 Navegando a la página de inicio de sesión...');
    // Iniciar sesión en el sistema
    const { browser, page } = await login(false);

    // 🔹 Esperar a que cargue la lista de registros
    console.log('⏳ Esperando carga de la lista de registros...');
    await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 3000 });
    
    // 🔹 Búsqueda de registro
    console.log('🔍 Buscando registro...');
    await interactWithElement(page, '[placeholder="Búsqueda..."]', 'fill', { text: '0123456789' });
    await interactWithElement(page, '[placeholder="Búsqueda..."]', 'press', { key: 'Enter' });
    await interactWithElement(page, '[placeholder="Búsqueda..."]', 'wait', { waitTime: 2000 });
    
    // 🔹 Esperar a que cargue la lista de registro
    await interactWithElement(page, 'td:has-text("USUARIO PRUEBAS DE ACTIVACION")', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'td:has-text("USUARIO PRUEBAS DE ACTIVACION")', 'doubleClick');

    // 🔹 click sobre Ticket
    console.log('🎫 Creando ticket...');
    await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'doubleClick');
    await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'wait', { waitTime: 2000 });
    

    // 🔹 Esperar a que cargue el boton de editar
    await interactWithElement(page, 'button:has-text("Editar")', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'button:has-text("Editar")', 'click');
    
    

    // 🔹 Rellenar campo de título del ticket
    console.log('📝 Rellenando campo de título del ticket...');
    await interactWithElement(page, '.o_group', 'wait', { waitTime: 3000 });

    await interactWithElement(page, 'input[name="name"]', 'fill', { text: 'ticket automatizado : Corte clientes por 5 dias' });

    // Interactuar con el campo "Equipo"
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'fill', { text: 'PAGOS Y COBRANZAS' });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'Enter' });
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'doubleClick');
    await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'Tab' });
    
    // Interactuar con el campo "Usuario asignado"
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input',  'fill', { text: '	GALAN CORDOVA WILLAN ALEXANDER' });
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'doubleClick');
    await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'Tab' });


    
    // Interactuar con el campo "Canal"
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'fill', { text: 'PÁGINA WEB' });
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'press', { key: 'Enter' });
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'doubleClick');
    await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'press', { key: 'Tab' });

     // Interactuar con el campo "Categoria"
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'fill', { text: 'Pagos y cobranzas' });
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'press', { key: 'Enter' });
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'doubleClick');
    await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'press', { key: 'Tab' });

     // Interactuar con el campo "Etiqueta"
     await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'wait', { waitTime: 2000 });        

     await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'fill', { text: 'NO PROCEDENTE' });
     await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'press', { key: 'Enter' });
     await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'doubleClick');
     await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'press', { key: 'Tab' });
     await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'press', { key: 'Enter' });
     
     // Guardar ticket
    await interactWithElement(page, 'button.btn:has-text("Guardar")', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'button.btn:has-text("Guardar")', 'click');
    await page.waitForTimeout(5000);
    await browser.close();
    await page.pause();
    
    console.log('✅ ¡Proceso completado con éxito!');
  } catch (error) {
    console.error('❌ Error durante la automatización:', error);
  }
}

// Ejecutar la automatización
runAutomation().catch(console.error);