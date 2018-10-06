grammar commonlexer;

fragment YEAR : [2][0][0][0-9] | [2][0][1][0-5];
fragment MONTH : [0]?[0-9] | [1][0-2];
fragment DAY : [0]?[0-9] | [1-2][0-9] | [3][0-1];
fragment DATE_SPERATOR : ('/' | '-');

YYYY_MM_DD: YEAR DATE_SPERATOR MONTH DATE_SPERATOR DAY;

DISPLAY_PREFIX : 'show' | 'list' | 'get' | 'show all' | 'list all' | 'get all' | 'sales of' | 'all';

ASSOC : 'in' | 'of' | 'by' | 'on' | 'this' | 'that' | 'to' | 'for' | 'in last' | 'between';

SUMOPERATOR: 'sum' | 'Sum' | 'SUM';

COUNTOPERATOR: 'count' | 'Count' | 'COUNT';

AVGOPERATOR:'Avg' | 'AVG' | 'avg' | 'AVERAGE' | 'average' | 'Average';

MINOPERATOR:'min' | 'Min' | 'MIN';

MAXOPERATOR:'max' | 'Max' | 'MAX';

FILTER_ID : 'where' | 'sold' | 'sold in' | 'that have' | 'that has' | 'which have' | 'which has' ;

GREATER_THAN_OPERATOR:('>' | 'greater than');

GREATER_THAN_EQUAL_OPERATOR:('>=' | 'greater than or equal to');

LESS_THAN_OPERATOR:('<' | 'less than');

LESS_THAN_EQUAL_OPERATOR:('<=' | 'less than or equal to');

RELATION_OPERATOR : ('=' | '!=' | '<=' | '<' | '>' | '>=');
AND_OR_OPERATOR : ('and' | '&&' | 'or' | '|');

VERSUS: 'vs' | 'VS' | 'Vs' | 'versus' | 'Versus' | 'VERSUS';
COMPARE: 'compare' | 'Compare' | 'COMPARE' | 'compares';
WITH:'with' | 'With';

GENSTR: (NUM_LITERAL)* STRING_LITERAL ((STRING_LITERAL | NUM_LITERAL)*)?;
STR : [a-z]+;
NUM : [0-9]+;
STRNUM : STR NUM;
COMMA:',';

STRING_LITERAL: 'a'..'z' | 'A'..'Z'| '-' | ':' | '.' | '&' | '/' | '\\' | ';' | '_' | '*' | '#' | '@' | '(' | ')' | '[' | ']' | '{' | '}';

NUM_LITERAL:'0'..'9';

WS : [' ' | '\t' | '\n' | '\r' | '\f']+ -> skip;