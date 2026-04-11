type FontStyle = {
  fontFamily: string;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
};

const fonts: {
  thin: FontStyle;
  ultraLight: FontStyle;
  light: FontStyle;
  regular: FontStyle;
  medium: FontStyle;
  semiBold: FontStyle;
  bold: FontStyle;
  extraBold: FontStyle;
  heavy: FontStyle;
} = {
  thin: {
    fontFamily: 'poppins-Thin',
    fontWeight: 'normal',
  },
  ultraLight: {
    fontFamily: 'poppins-UltraLight',
    fontWeight: 'normal',
  },
 light: {
    fontFamily: 'Poppins-Light', // Ensure this font file is correctly linked
    fontWeight: '300', // Matches Figma's weight requirement
  },
  regular: {
    fontFamily: 'poppins-Regular',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'Poppins-Medium',
    fontWeight: 'normal',
  },
  semiBold: {
    fontFamily: 'poppins-SemiBold',
    fontWeight: 'normal',
  },
  bold: {
    fontFamily: 'Poppins-Bold',
    fontWeight: '500',
  },
  extraBold: {
    fontFamily: 'poppins-ExtraBold',
    fontWeight: 'normal',
  },
  heavy: {
    fontFamily: 'poppins-Heavy',
    fontWeight: 'normal',
  },
};

export default fonts;
