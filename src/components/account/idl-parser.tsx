import React from 'react';
import { IdlType, IdlInstruction, IdlTypeDef, IdlParserProps, CustomIdl } from '@/types/idl';

const IdlParser: React.FC<IdlParserProps> = ({ idl }) => {
  const renderType = (type: IdlType): JSX.Element => {
    if (typeof type === 'string') {
      return <span className="text-orange-300">{type}</span>;
    } else if (type && typeof type === 'object') {
      if ('defined' in type) {
        return <span className="text-orange-300">{type.defined}</span>;
      } else if ('option' in type) {
        return <span>Option&lt;{renderType(type.option)}&gt;</span>;
      } else if ('vec' in type) {
        return <span>Vec&lt;{renderType(type.vec)}&gt;</span>;
      } else if ('array' in type) {
        return <span>[{renderType(type.array[0])}; {type.array[1]}]</span>;
      }
    }
    return <span>{JSON.stringify(type)}</span>;
  };

  const renderInstruction = (instruction: IdlInstruction) => (
    <div key={instruction.name} className="mb-4">
      <h3 className="text-xl font-semibold">{instruction.name}</h3>
      <h4 className="font-semibold mt-2 text-orange-500">Accounts</h4>
      <ul className="list-disc pl-5">
        {instruction.accounts.map((account: any, index) => (
          <li key={index}>
            {'accounts' in account ? (
              <div className="text-orange-500">
                {account.name} (group)
              </div>
            ) : (
              <div>
                {account.name}:
                <span className="text-orange-300">
                  {account.isMut ? ' Mutable' : ' Immutable'}
                </span>
                {account.isSigner && (
                <>
                  <span>, </span>
                  <span className="text-orange-300">Signer</span>
                </>
              )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {instruction.args.length > 0 && (
        <>
          <h4 className="font-semibold mt-2 text-orange-500">Arguments</h4>
          <ul className="list-disc pl-5">
            {instruction.args.map((arg, index) => (
              <li key={index}>
                {arg.name}: {renderType(arg.type)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const renderTypeDef = (typeDef: IdlTypeDef) => (
    <div key={typeDef.name} className="mb-4">
      <h3 className="text-xl font-semibold text-orange-500">{typeDef.name}</h3>
      {typeDef.type.kind === 'struct' && typeDef.type.fields && (
        <ul className="list-disc pl-5">
          {typeDef.type.fields.map((field, index) => (
            <li key={index}>
              {field.name}: {renderType(field.type)}
            </li>
          ))}
        </ul>
      )}
      {typeDef.type.kind === 'enum' && typeDef.type.variants && (
        <ul className="list-disc pl-5">
          {typeDef.type.variants.map((variant, index) => (
            <li key={index}>{variant.name}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const customIdl = idl as unknown as CustomIdl;

  return (
    <div className="p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        {customIdl.name} v{customIdl.version}
      </h2>
      <h2 className="text-xl font-semibold mb-4">
        Instructions
      </h2>
      {customIdl.instructions.map(renderInstruction)}
      {customIdl.types && (
        <>
          <h2 className="text-xl font-semibold mb-2 mt-6">Types</h2>
          {customIdl.types.map(renderTypeDef)}
        </>
      )}
    </div>
  );
};

export default IdlParser;