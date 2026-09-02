import 'package:deriv_chart/core_chart.dart';
import 'package:flutter/material.dart';

/// Size of the action icons in the on-chart indicator labels.
///
/// The library's own default is tuned against a phone-sized chart. This app
/// renders on a desktop-width one - roughly three times wider - where the same
/// absolute size reads as much smaller against its surroundings, so both this
/// and [_labelFontSize] are raised to restore the intended proportions.
///
/// These two constants are the knob: change them and rebuild the web bundle.
const double _labelIconSize = 20;

/// Font size of the indicator-label title. See [_labelIconSize].
const double _labelFontSize = 16;

/// Everything about the indicator label that this app sizes differently from
/// the library default. Mixed into both themes so the two stay in step.
mixin _WebIndicatorLabelSizing on ChartDefaultTheme {
  @override
  double get indicatorLabelIconSize => _labelIconSize;

  @override
  TextStyle get indicatorLabelTextStyle => super
      .indicatorLabelTextStyle
      .copyWith(fontSize: _labelFontSize);
}

/// [ChartDefaultLightTheme] with this app's indicator-label sizing.
class WebChartLightTheme extends ChartDefaultLightTheme
    with _WebIndicatorLabelSizing {}

/// [ChartDefaultDarkTheme] with this app's indicator-label sizing.
class WebChartDarkTheme extends ChartDefaultDarkTheme
    with _WebIndicatorLabelSizing {}
