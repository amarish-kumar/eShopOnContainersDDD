import * as React from 'react';
import { observable, action, computed } from 'mobx';
import { DateTime } from 'luxon';

import { withStyles, WithStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

interface DateRangeProps {
  id: string;
  required?: boolean;
  label: string;
  error?: any;
  value?: { from: string, to: string };

  onChange?: (newVal: { from: string, to: string }) => void;
}

interface DateRangeState {
  from?: Date;
  to?: Date;
}

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 100,
  },
});

const InputWrap = (className: string) => {
  return class extends React.PureComponent {
    private _input: any;

    public focus = () => {
      this._input.focus();
    }

    public render() {
      return (
        <Input inputRef={el => (this._input = el)} {...this.props} className={className} />
      );
    }
  };
};

class DateRangeControl extends React.Component<DateRangeProps & WithStyles<'container' | 'formControl'>, DateRangeState> {
  private _to: DayPickerInput;

  constructor(props) {
    super(props);

    const { value } = props;

    this.state = {
      from: value ? DateTime.fromISO(value.from).toJSDate() : undefined,
      to: value ? DateTime.fromISO(value.to).toJSDate() : undefined
    };
  }

  public componentDidUpdate() {
    const { from, to } = this.state;
    if (this.props.onChange && from && to) {
      this.props.onChange({ from: DateTime.fromJSDate(from).toISO(), to: DateTime.fromJSDate(to).toISO() });
    }
  }

  private handleFromChange = (from: Date) => {
    this.setState({ from });
  }
  private handleToChange = (to: Date) => {
    this.setState({ to });
  }
  private formatDate = (date?: Date, format?: string, locale?: string) => {
    return DateTime.fromJSDate(date).toFormat(format);
  }
  private parseDate = (str?: string, format?: string, locale?: string) => {
    return DateTime.fromFormat(str, format).toJSDate();
  }

  public render() {
    const { from, to } = this.state;
    const { id, label, required, error, value, classes } = this.props;

    const modifiers = { start: from, end: to };
    return (
      <FormControl required={required} className={classes.container} error={error && error[id] ? true : false} aria-describedby={id + '-text'}>
        <Grid container spacing={8}>
          <Grid item xs={4}>
            <DayPickerInput
              value={from}
              placeholder='From'
              format='MMM d, yyyy'
              formatDate={this.formatDate}
              parseDate={this.parseDate}
              dayPickerProps={{
                selectedDays: [from, { from, to }],
                disabledDays: { after: to },
                toMonth: to,
                modifiers,
                numberOfMonths: 2,
              }}
              component={InputWrap(classes.formControl)}
              onDayChange={this.handleFromChange}
            />
          </Grid>
          <Grid item xs={6}>
            {' '}—{' '}
            <DayPickerInput
              ref={el => (this._to = el)}
              value={to}
              placeholder='To'
              format='MMM d, yyyy'
              formatDate={this.formatDate}
              parseDate={this.parseDate}
              dayPickerProps={{
                selectedDays: [from, { from, to }],
                disabledDays: { before: from },
                modifiers,
                month: from,
                fromMonth: from,
                numberOfMonths: 2,
              }}
              component={InputWrap(classes.formControl)}
              onDayChange={this.handleToChange}
            />
          </Grid>
        </Grid>
        {error && error[id] ? error[id].map((e, key) => (<FormHelperText key={key} id={id + '-' + key + '-text'}>{e}</FormHelperText>)) : undefined}
      </FormControl>
    );
  }
}
export default withStyles(styles as any)<DateRangeProps>(DateRangeControl);
