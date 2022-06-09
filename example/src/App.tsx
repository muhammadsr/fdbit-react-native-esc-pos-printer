import * as React from 'react';
// @ts-ignore
import EscPosEncoder from 'esc-pos-encoder';

import { StyleSheet, View, Button } from 'react-native';

// const { createCanvas } = require('canvas');

import EscPosPrinter, { getPrinterSeriesByName, IPrinter } from '../../';
import {} from 'react-native';
import { base64Image } from './base64Image';
export default function App() {
  const [init, setInit] = React.useState(false);
  const [printer, setPrinter] = React.useState<IPrinter | null>(null);
  React.useEffect(() => {
    EscPosPrinter.addPrinterStatusListener((status) => {
      console.log('current printer status:', status);
    });
  }, []);
  React.useEffect(() => {
    console.log(printer);
  }, [printer]);

  return (
    <View style={styles.container}>
      <Button
        title="Discover"
        onPress={() => {
          console.log('discovering');
          EscPosPrinter.discover()
            .then((printers) => {
              console.log('done!', printers);
              if (printers[0]) {
                setPrinter(printers[0]);
              }
            })
            .catch(console.log);
        }}
      />

      <Button
        title="Get lines per row"
        disabled={!printer}
        color={!printer ? 'gray' : 'blue'}
        onPress={async () => {
          if (printer) {
            if (!init) {
              await EscPosPrinter.init({
                target: printer.target,
                seriesName: getPrinterSeriesByName('EPOS2_TM_T20'),
                language: 'EPOS2_LANG_EN',
              });
            }
            // const status = await EscPosPrinter.getPrinterCharsPerLine(
            //   getPrinterSeriesByName(printer.name)
            // );

            // console.log('print', status);
          }
        }}
      />

      <Button
        title="Start monitor printer status"
        disabled={!printer}
        color={!printer ? 'gray' : 'blue'}
        onPress={async () => {
          if (printer) {
            if (!init) {
              await EscPosPrinter.init({
                target: printer.target,
                seriesName: getPrinterSeriesByName('EPOS2_TM_T20'),
                language: 'EPOS2_LANG_EN',
              });
              setInit(true);
            }

            const width = 500;
            const printing = new EscPosPrinter.printing();
            await printing
              .initialize()
              .align('center')
              .textColumnsAsImage(['QTY', 'ITEM', 'TOTAL'], {
                textSize: 12,
                width,
                isRTL: true,
              })
              // .text('Muhammad Alraddadi Muhammad Alraddadi Alraddadi')
              .newline()
              // .textAsImage(['2x', 'Moshakkal Raheeb w/CHZ', '200.0'], {
              //   textSize: 550,
              //   width: 550,
              // })
              .textColumnsAsImage(['2x', 'مشكل رهيب مع الجبنه', '200.0'], {
                textSize: 10,
                width,
                isRTL: true,
              })
              .textColumnsAsImage(['2x', 'مشكل من دون الجبنه', '200.0'], {
                textSize: 10,
                width,
                isRTL: true,
              })
              .textColumnsAsImage(['', '  اضافات: سكر', ''], {
                textSize: 9,
                width,
                isRTL: true,
              })
              .text('Muhammad Alraddadi')
              .newline(5)
              .cut()
              .send();
            // const status = await EscPosPrinter.startMonitorPrinter();

            // console.log('Printer status:', status);
          }
        }}
      />

      <Button
        title="Stop monitor printer status"
        disabled={!printer}
        color={!printer ? 'gray' : 'blue'}
        onPress={async () => {
          if (printer) {
            if (!init) {
              await EscPosPrinter.init({
                target: printer.target,
                seriesName: getPrinterSeriesByName(printer.name),
                language: 'EPOS2_LANG_EN',
              });
              setInit(true);
            }

            const status = await EscPosPrinter.stopMonitorPrinter();

            console.log('Printer status:', status);
          }
        }}
      />

      <Button
        title="Print from data"
        disabled={!printer}
        color={!printer ? 'gray' : 'blue'}
        onPress={async () => {
          const encoder = new EscPosEncoder();

          encoder
            .initialize()
            .codepage('cp864')
            .text('The quick brown fox jumps over the lazy dog')
            .text('السلام عليكم السلام عليكم السلام عليكم')
            .text(
              '简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文简体中文'
            )
            .newline();

          try {
            if (printer) {
              if (!init) {
                await EscPosPrinter.init({
                  target: printer.target,
                  seriesName: getPrinterSeriesByName(printer.name),
                  language: 'EPOS2_LANG_MULTI',
                });
                setInit(true);
              }

              const printing = new EscPosPrinter.printing();

              const status = await printing
                .data(encoder.encode())
                .newline(5)
                .cut()
                .send();

              console.log('print', status);
            }
          } catch (error) {
            console.log('error', error);
          }
        }}
      />
      <Button
        title="Test print chaining"
        disabled={!printer}
        color={!printer ? 'gray' : 'blue'}
        onPress={async () => {
          try {
            if (printer) {
              if (!init) {
                await EscPosPrinter.init({
                  target: printer.target,
                  seriesName: getPrinterSeriesByName(printer.name),
                  language: 'EPOS2_LANG_EN',
                });
                setInit(true);
              }

              const printing = new EscPosPrinter.printing();
              const status = await printing
                .initialize()
                .align('center')
                .size(3, 3)
                .line('DUDE!')
                .smooth(true)
                .line('DUDE!')
                .smooth(false)
                .size(1, 1)
                .text('is that a ')
                .bold()
                .underline()
                .text('printer?')
                .bold()
                .underline()
                .newline(2)
                .align('center')
                .image(require('./store.png'), {
                  width: 75,
                  halftone: 'EPOS2_HALFTONE_THRESHOLD',
                })
                .image({ uri: base64Image }, { width: 75 })
                .image(
                  {
                    uri:
                      'https://raw.githubusercontent.com/tr3v3r/react-native-esc-pos-printer/main/ios/store.png',
                  },
                  { width: 75 }
                )
                .barcode({
                  value: 'Test123',
                  type: 'EPOS2_BARCODE_CODE93',
                  width: 2,
                  height: 50,
                  hri: 'EPOS2_HRI_BELOW',
                })
                .qrcode({
                  value: 'Test123',
                  level: 'EPOS2_LEVEL_M',
                  width: 5,
                })
                .cut()
                .send();

              console.log('printing', status);
            }
          } catch (error) {
            console.log('error', error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
