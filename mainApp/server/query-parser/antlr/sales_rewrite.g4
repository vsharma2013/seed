grammar sales_rewrite;
import commonlexer;

query 
	: (operator_spec (ASSOC? querySpec)? ASSOC?)* display_aspect queryRelationSpec? (ASSOC queryRelationSpec)* EOF;


display_aspect : DISPLAY_PREFIX?;

queryRelationSpec: querySpec relation_operatorSpec?;

querySpec: time_spec | operator_spec | compareSpec | main_entity_spec;

compareSpec: comparevsSpec | comparewithSpec;

comparevsSpec: compareFirstTermSpec VERSUS compareSecondTermSpec;

comparewithSpec:COMPARE compareFirstTermSpec WITH compareSecondTermSpec;

compareFirstTermSpec:multiple_entity_spec;

compareSecondTermSpec:multiple_entity_spec;

main_entity_spec:multiple_entity_spec;

multiple_entity_spec: domainSpec (COMMA? domainSpec)*;

domainSpec:GENSTR;

time_spec:timeSpec;

timeSpec 
	: timeInLastYearsSpec
	| timeInLastMonthsSpec
	| timeInLastDaysSpec
	| timeInYearSpec
	| timeBetweenYearsSpec
	| timeBetweenDatesSpec
	;

timeInLastYearsSpec : NUM year_spec;
timeInLastMonthsSpec : NUM month_spec;
timeInLastDaysSpec : NUM day_spec;
timeInYearSpec : NUM;
timeBetweenYearsSpec : NUM AND_OR_OPERATOR NUM;
timeBetweenDatesSpec : YYYY_MM_DD AND_OR_OPERATOR YYYY_MM_DD;


year_spec : 'years' | 'year';
month_spec :  'months' | 'month';
day_spec : 'days' | 'day';

operator_spec:operatorSpec;
operatorSpec : SUMOPERATOR | COUNTOPERATOR | AVGOPERATOR | MINOPERATOR | MAXOPERATOR;

relation_operatorSpec: relationOperatorSpec NUM;
relationOperatorSpec:GREATER_THAN_OPERATOR | GREATER_THAN_EQUAL_OPERATOR | LESS_THAN_OPERATOR | LESS_THAN_EQUAL_OPERATOR;