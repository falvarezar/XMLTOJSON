const xml2js = require('xml2js')
import fs from 'fs'
import axios from 'axios';
let i
let j
let k
let l
let m

// read XML from a file
const xml = fs.readFileSync('pedidoya.xml')

async function xmltojson(xml: any) {
  const result = await xml2js.parseStringPromise(xml, { mergeAttrs: true })

  // convert it to a JSON string
  const jsonDE = JSON.stringify(result, null, 4)
  const formateado = toJSON(JSON.parse(jsonDE))

  axios.post(`http://localhost/cuenta/respuesta`, formateado)
    .then((response: any) => {
      var toJSON = response.data
      console.log(toJSON)
    }).catch((error: any) => {
      console.log(error);
    })
}

function toJSON(obj: any) {
  //============================================================================
  let cTimbrado = ''
  let cTimbDoc
  for (i in obj.rDE.DE[0].gTimb[0]) {
    cTimbrado += `"${i}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gTimb[0][i][0]) + '",'
  }
  cTimbDoc = cTimbrado.substring(0, cTimbrado.length - 1)
  //============================================================================

  //============================================================================
  let cEmisor = ''
  let cProveedor
  let cElemento
  for (i in obj.rDE.DE[0].gDatGralOpe[0].gEmis[0]) {
    cElemento = obj.rDE.DE[0].gDatGralOpe[0].gEmis[0][i][0]
    if (isObject(cElemento)) {
      // omite cuando el elemento es un objeto
    } else {
      cEmisor += `"${i}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDatGralOpe[0].gEmis[0][i][0]) + '",'
    }
  }
  cProveedor = cEmisor.substring(0, cEmisor.length - 1)

  //=============================================================================

  //============================================================================
  let cReceptor = ''
  let cCliente
  for (i in obj.rDE.DE[0].gDatGralOpe[0].gDatRec[0]) {
    cReceptor += `"${i}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDatGralOpe[0].gDatRec[0][i][0]) + '",'
  }
  cCliente = cReceptor.substring(0, cReceptor.length - 1)
  //============================================================================

  //============================================================================
  let cForma = ''
  let cFormaPago
  if (obj.rDE.DE[0].gDtipDE[0].gCamCond[0].iCondOpe[0] == '1') {
    for (i in obj.rDE.DE[0].gDtipDE[0].gCamCond[0].gPaConEIni[0]) {
      cForma += `"${i}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDtipDE[0].gCamCond[0].gPaConEIni[0][i][0]) + '",'
    }
  } else {
    for (i in obj.rDE.DE[0].gDtipDE[0].gCamCond[0].gPagCred[0]) {
      cForma += `"${i}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDtipDE[0].gCamCond[0].gPagCred[0][i][0]) + '",'
    }
  }
  cFormaPago = cForma.substring(0, cForma.length - 1)
  //============================================================================

  //============================================================================
  let cRegistro = ''
  let cDetalle = ''
  for (i in obj.rDE.DE[0].gDtipDE[0].gCamItem) {
    for (j in obj.rDE.DE[0].gDtipDE[0].gCamItem[i]) {
      if (j == 'gValorItem') {
        for (k in obj.rDE.DE[0].gDtipDE[0].gCamItem[i].gValorItem[0]) {
          if (k == 'gValorRestaItem') {
            for (l in obj.rDE.DE[0].gDtipDE[0].gCamItem[i].gValorItem[0].gValorRestaItem[0]) {
              cRegistro += `"${l}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDtipDE[0].gCamItem[i].gValorItem[0].gValorRestaItem[0][l][0]) + '",'
            }
          } else {
            cRegistro += `"${k}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDtipDE[0].gCamItem[i].gValorItem[0][k][0]) + '",'
          }
        }
      } else if (j == 'gCamIVA') {
        for (m in obj.rDE.DE[0].gDtipDE[0].gCamItem[i].gCamIVA[0]) {
          cRegistro += `"${m}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDtipDE[0].gCamItem[i].gCamIVA[0][m][0]) + '",'
        }
      } else {
        cRegistro += `"${j}"` + ':"' + sinDiacriticos(obj.rDE.DE[0].gDtipDE[0].gCamItem[i][j][0]) + '",'
      }
    }
    cDetalle += '{' + cRegistro.substring(0, cRegistro.length - 1) + '},'
    cRegistro = ''
  }
  cDetalle = cDetalle.substring(0, cDetalle.length - 1)
  //=============================================================================

  var objson = '{'
    + '"cdc"' + ':"' + `${obj.rDE.DE[0].Id[0]}` + '",'
    + '"fecha"' + ':"' + `${obj.rDE.DE[0].gDatGralOpe[0].dFeEmiDE[0]}` + '",'
    + cTimbDoc + ','
    + cProveedor + ','
    + cCliente + ','
    + '"condicion"' + ':"' + `${obj.rDE.DE[0].gDtipDE[0].gCamCond[0].iCondOpe[0]}` + '",'
    + cFormaPago + ','
    + '"qr"' + ':"' + `${obj.rDE.gCamFuFD[0].dCarQR[0]}` + '",'
    + '"items"' + ':[' + cDetalle + ']'
    + '}'

  return JSON.parse(objson)

}

function isObject(obj: any) {
  return obj === Object(obj);
}

let sinDiacriticos = (() => {
  let de = 'ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç',
    a = 'AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc',
    re = new RegExp('[' + de + ']', 'ug');

  return (texto: any) =>
    texto.replace(
      re,
      (match: any) => a.charAt(de.indexOf(match))
    );
})();


xmltojson(xml)


//OBTENGO EL CDC
//obj.rDE.DE[0].Id[0]

//OBTENGO FECHA DE LA FACTURA
//console.log(obj.rDE.DE[0].gDatGralOpe[0].dFeEmiDE[0])

//OBTENGO TIMBRADO Y NRO_DOCUMENTO
//console.log(obj.rDE.DE[0].gTimb[0])

//OBTENGO DATOS DEL EMISOR (PROVEEDOR)
//console.log(obj.rDE.DE[0].gDatGralOpe[0].gEmis[0])

//OBTENGO DATOS DEL RECEPTOR (CLIENTE)
//console.log(obj.rDE.DE[0].gDatGralOpe[0].gDatRec[0])

//OBTENGO DATOS DE CONDICION DE VENTA
//console.log(obj.rDE.DE[0].gDtipDE[0].gCamCond[0])

// OBTENGO DATOS DE LA FORMA DE PAGO SI ES CONTADO/CREDITO
/*if (obj.rDE.DE[0].gDtipDE[0].gCamCond[0].iCondOpe[0] == '1') {
  console.log(obj.rDE.DE[0].gDtipDE[0].gCamCond[0].gPaConEIni)
} else {
  console.log(obj.rDE.DE[0].gDtipDE[0].gCamCond[0].gPagCred)
}*/

//OBTENGO LOS DATOS DEL QR
//console.log(obj.rDE.gCamFuFD[0].dCarQR[0])

//OBTENGO DATOS DEL DETALLE
//console.log(obj.rDE.DE[0].gDtipDE[0].gCamItem)

//OBTENGO EL TOTAL DEL ITEM SIN DESCUENTO
//console.log(obj.rDE.DE[0].gDtipDE[0].gCamItem[0].gValorItem[0])

//OBTENGO LOS IMPORTES DEL ITEM CON DESCUENTO
//console.log(obj.rDE.DE[0].gDtipDE[0].gCamItem[0].gValorItem[0].gValorRestaItem)

//OBTENGO LOS DATOS DEL IVA
//console.log(obj.rDE.DE[0].gDtipDE[0].gCamItem[0].gCamIVA[0])


/*
// XML string to be parsed to JSON
const xml = `<?xml version="1.0" encoding="UTF-8" ?>
            <user id="1">
                <name>John Doe</name>
                <email>john.doe@example.com</email>
                <roles>
                    <role>Member</role>
                    <role>Admin</role>
                </roles>
                <admin>true</admin>
            </user>`

// convert XML to JSON
xml2js.parseString(xml, (err, result) => {
  if (err) {
    throw err
  }

  // `result` is a JavaScript object
  // convert it to a JSON string
  const json = JSON.stringify(result, null, 4)

  // log JSON string
  console.log(json)
})*/

/*
// read XML from a file
const xml = fs.readFileSync('user.xml')
// convert XML to JSON
xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
  if (err) {
    throw err
  }

  // `result` is a JavaScript object
  // convert it to a JSON string
  const json = JSON.stringify(result, null, 4)

  // save JSON in a file
  fs.writeFileSync('user.json', json)
})*/








