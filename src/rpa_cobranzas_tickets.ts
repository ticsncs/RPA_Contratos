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
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'fill', { text: 'PAGOS Y COBRANZAS' });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'press', { key: 'Tab' });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'press', { key: 'Tab' });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'press', { key: 'Tab' });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'press', { key: 'Tab' });
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'wait', { waitTime: 2000 });


    await interactWithElement(page, 'label:has-text("Canal")', 'paste', { text: 'PÁGINA WEB' });

    // 🔹 Seleccionar la primera opción del dropdown
    await interactWithElement(page, '#o_field_input_2607', 'fill', { text: 'PAGOS Y COBRANZAS' });
    await interactWithElement(page, 'input.ui-autocomplete-input', 'wait', { waitTime: 2000 });
    await interactWithElement(page, '.ui-autocomplete li:first-child', 'click');



    await interactWithElement(page, 'input.ui-autocomplete-input', 'press', { key: 'Enter' });
  
    
    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'fill', { text: 'PÁGINA WEB' });

    await interactWithElement(page, 'div.o_input_dropdown input.o_input.ui-autocomplete-input', 'press', { key: 'Enter' });

    await page.pause();
    // Esperar a que aparezca la lista de opciones
    //await page.waitForSelector('.ui-autocomplete', { timeout: 5000 });
    
    // Seleccionar la primera opción del dropdown
    //await interactWithElement(page, '.ui-autocomplete li:first-child', 'click'); await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('✅ ¡Proceso completado con éxito!');
  } catch (error) {
    console.error('❌ Error durante la automatización:', error);
  }
}

// Ejecutar la automatización
runAutomation().catch(console.error);